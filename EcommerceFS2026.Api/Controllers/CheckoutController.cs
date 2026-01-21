using EcommerceFS2026.Api.Models.Checkout;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Domain.Enums;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/checkout")]
public class CheckoutController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CheckoutController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        if (request.Items.Count == 0)
        {
            return BadRequest("Se requiere al menos un item.");
        }

        var variantIds = request.Items.Select(item => item.ProductVariantId).ToList();
        var variants = await _dbContext.ProductVariants
            .Where(variant => variantIds.Contains(variant.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in request.Items)
        {
            var variant = variants.FirstOrDefault(variant => variant.Id == item.ProductVariantId);

            if (variant is null)
            {
                return BadRequest($"Variante no encontrada: {item.ProductVariantId}");
            }

            if (variant.StockActual - variant.StockReserved < item.Quantity)
            {
                return BadRequest($"Stock insuficiente para {item.ProductName}");
            }
        }

        var order = new Order
        {
            CustomerName = request.FullName,
            CustomerEmail = request.Email,
            CustomerPhone = request.Phone,
            CustomerDni = request.Dni,
            ShippingAddress = request.Address,
            ShippingCity = request.City,
            ShippingPostalCode = request.PostalCode,
            Status = OrderStatus.PendingPayment,
            Currency = "ARS",
            TotalAmount = request.Items.Sum(item => item.UnitPrice * item.Quantity)
        };

        _dbContext.Orders.Add(order);

        foreach (var item in request.Items)
        {
            _dbContext.OrderItems.Add(new OrderItem
            {
                Order = order,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity
            });

            var reservation = new StockReservation
            {
                ProductVariantId = item.ProductVariantId,
                Order = order,
                Quantity = item.Quantity,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15),
                Status = StockReservationStatus.Active
            };

            _dbContext.StockReservations.Add(reservation);

            var variant = variants.First(variant => variant.Id == item.ProductVariantId);
            variant.StockReserved += item.Quantity;
            variant.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { order.Id, order.TotalAmount });
    }
}
