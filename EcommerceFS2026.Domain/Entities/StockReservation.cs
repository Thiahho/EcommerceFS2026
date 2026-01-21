using EcommerceFS2026.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("stock_reservations")]
public class StockReservation : Entity
{
    [Column("product_variant_id")]
    public Guid ProductVariantId { get; set; }

    [Column("order_id")]
    public Guid? OrderId { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    [Column("status")]
    public StockReservationStatus Status { get; set; } = StockReservationStatus.Active;

    public ProductVariant? ProductVariant { get; set; }
}
