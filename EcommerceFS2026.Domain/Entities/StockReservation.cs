using EcommerceFS2026.Domain.Enums;

namespace EcommerceFS2026.Domain.Entities;

public class StockReservation : Entity
{
    public Guid ProductVariantId { get; set; }
    public Guid? OrderId { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public StockReservationStatus Status { get; set; } = StockReservationStatus.Active;

    public ProductVariant? ProductVariant { get; set; }
}
