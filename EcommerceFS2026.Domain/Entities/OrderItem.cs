using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("order_items")]
public class OrderItem : Entity
{
    [Column("id")]
    public Guid OrderId { get; set; }

    [Column("product_variant_id")]
    public Guid ProductVariantId { get; set; }

    [Column("product_name")]
    public string ProductName { get; set; } = string.Empty;

    [Column("unit_price")]
    public decimal UnitPrice { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    public Order? Order { get; set; }
    public ProductVariant? ProductVariant { get; set; }
}
