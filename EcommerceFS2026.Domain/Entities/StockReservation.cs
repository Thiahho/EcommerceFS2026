using System.ComponentModel.DataAnnotations.Schema;
using EcommerceFS2026.Domain.Enums;

namespace EcommerceFS2026.Domain.Entities;

[Table("stock_reservations")]
public class StockReservation 
{
    [Column("id")]
    public int Id { get; set; }
    [Column("product_variant_id")]
    public int ProductVariantId { get; set; }
    [Column("order_id")]
    public int? OrderId { get; set; }
    [Column("quantity")]
    public int Quantity { get; set; }
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    public StockReservationStatus Status { get; set; } = StockReservationStatus.Active;

    public Order? Order { get; set; }
    public ProductVariant? ProductVariant { get; set; }
}
