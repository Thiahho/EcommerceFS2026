using EcommerceFS2026.Api.Models.Payments;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Domain.Enums;
using EcommerceFS2026.Infrastructure.Data;

using MercadoPago.Client;
using MercadoPago.Client.Payment;
using MercadoPago.Client.PaymentMethod;
using MercadoPago.Client.Preference;
using MercadoPago.Config;

using MercadoPago.Resource;
using MercadoPago.Resource.Payment;
using MercadoPago.Resource.Preference;

// Alias para evitar ambigüedad
using MpPaymentMethod = MercadoPago.Resource.PaymentMethod.PaymentMethod;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _dbContext;

    public PaymentsController(IConfiguration configuration, AppDbContext dbContext)
    {
        _configuration = configuration;
        _dbContext = dbContext;
    }

    [HttpGet("methods")]
public async Task<IActionResult> GetPaymentMethods(CancellationToken cancellationToken)
{
    var accessToken = _configuration["MercadoPago:AccessToken"];
    if (string.IsNullOrWhiteSpace(accessToken))
        return BadRequest("Falta configurar MercadoPago:AccessToken.");

    MercadoPagoConfig.AccessToken = accessToken;

    var requestOptions = new RequestOptions { AccessToken = accessToken };

    var client = new PaymentMethodClient();
    ResourcesList<MpPaymentMethod> paymentMethods = await client.ListAsync(requestOptions);

    return Ok(paymentMethods);
}


    [HttpPost("preference")]
    public async Task<IActionResult> CreatePreference(
        [FromBody] CreatePreferenceRequest request,
        CancellationToken cancellationToken)
    {
        var accessToken = _configuration["MercadoPago:AccessToken"];

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return BadRequest("Falta configurar MercadoPago:AccessToken.");
        }

        if (request.Items.Count == 0)
        {
            return BadRequest("Se requiere al menos un item.");
        }

        MercadoPagoConfig.AccessToken = accessToken;

        var preferenceRequest = new PreferenceRequest
        {
            Items = request.Items.Select(item => new PreferenceItemRequest
            {
                Title = item.Title,
                Quantity = item.Quantity,
                CurrencyId = item.CurrencyId,
                UnitPrice = item.UnitPrice,
                PictureUrl = string.IsNullOrWhiteSpace(item.PictureUrl) ? null : item.PictureUrl,
            }).ToList(),
            AutoReturn = "approved",
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = request.BackUrls.Success,
                Failure = request.BackUrls.Failure,
                Pending = request.BackUrls.Pending
            }
        };

        var requestOptions = new RequestOptions { AccessToken = accessToken };

        try
        {
            var client = new PreferenceClient();
            Preference preference = await client.CreateAsync(preferenceRequest, requestOptions);
            return Ok(new { preference.Id });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error MercadoPago: {ex.Message}");
            Console.WriteLine($"Inner: {ex.InnerException?.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment(
        [FromBody] ProcessPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var accessToken = _configuration["MercadoPago:AccessToken"];

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return BadRequest("Falta configurar MercadoPago:AccessToken.");
        }

        MercadoPagoConfig.AccessToken = accessToken;

        var paymentRequest = new PaymentCreateRequest
        {
            TransactionAmount = request.TransactionAmount,
            Token = request.Token,
            Description = request.Description,
            Installments = request.Installments,
            PaymentMethodId = request.PaymentMethodId,
            Payer = new PaymentPayerRequest
            {
                Email = request.Email
            }
        };

        var requestOptions = new RequestOptions { AccessToken = accessToken };

        var client = new PaymentClient();
        Payment payment = await client.CreateAsync(paymentRequest, requestOptions);


        var order = await _dbContext.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            return NotFound("Orden no encontrada.");
        }

        if (payment.Status == "approved")
        {
            var reservations = await _dbContext.StockReservations
                .Where(reservation => reservation.OrderId == order.Id && reservation.Status == StockReservationStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var reservation in reservations)
            {
                var variant = await _dbContext.ProductVariants
                    .FirstOrDefaultAsync(item => item.Id == reservation.ProductVariantId, cancellationToken);

                if (variant is null)
                {
                    continue;
                }

                variant.StockActual -= reservation.Quantity;
                variant.StockReserved -= reservation.Quantity;
                variant.UpdatedAt = DateTimeOffset.UtcNow;

                reservation.Status = StockReservationStatus.Consumed;
                reservation.UpdatedAt = DateTimeOffset.UtcNow;
            }

            order.Status = OrderStatus.Paid;
            order.PaymentProvider = "MercadoPago";
            order.PaymentStatus = payment.Status;
            order.UpdatedAt = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            order.Status = OrderStatus.PaymentFailed;
            order.PaymentProvider = "MercadoPago";
            order.PaymentStatus = payment.Status;
            order.UpdatedAt = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { payment.Id, payment.Status, orderId = order.Id });
    }
}
