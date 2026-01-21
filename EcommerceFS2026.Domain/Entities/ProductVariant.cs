using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("product_variants")]
public class ProductVariant : Entity
{
    [Column("id")]
    public Guid ProductId { get; set; }
    [Column("color")]
    public string Color { get; set; } = string.Empty;
    [Column("ram")]
    public string Ram { get; set; } = string.Empty;
    [Column("storage")]
    public string Storage { get; set; } = string.Empty;
    [Column("sku")]
    public string Sku { get; set; } = string.Empty;
    [Column("price")]
    public decimal Price { get; set; }
    [Column("stock_actual")]
    public int StockActual { get; set; }
    [Column("stock_reserved")]
    public int StockReserved { get; set; }
    [Column("active")]
    public bool Active { get; set; } = true;
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
    public Product? Product { get; set; }
    public ICollection<StockReservation> StockReservations { get; set; } = new List<StockReservation>();
}
