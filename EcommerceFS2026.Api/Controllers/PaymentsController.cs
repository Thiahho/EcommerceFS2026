using EcommerceFS2026.Api.Models.Payments;
using MercadoPago.Client.PaymentMethod;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource;
using MercadoPago.Resource.PaymentMethod;
using MercadoPago.Resource.Preference;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PaymentsController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("methods")]
    public async Task<IActionResult> GetPaymentMethods(CancellationToken cancellationToken)
    {
        var accessToken = _configuration["MercadoPago:AccessToken"];

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return BadRequest("Falta configurar MercadoPago:AccessToken.");
        }

        MercadoPagoConfig.AccessToken = accessToken;

        var client = new PaymentMethodClient();
        ResourcesList<PaymentMethod> paymentMethods = await client.ListAsync(cancellationToken);

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
                UnitPrice = item.UnitPrice
            }).ToList(),
            AutoReturn = "approved",
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = request.BackUrls.Success,
                Failure = request.BackUrls.Failure,
                Pending = request.BackUrls.Pending
            }
        };

        var client = new PreferenceClient();
        Preference preference = await client.CreateAsync(preferenceRequest, cancellationToken);

        return Ok(new { preference.Id });
    }
}
