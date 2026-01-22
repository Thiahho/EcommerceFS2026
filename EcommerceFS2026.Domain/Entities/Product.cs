using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("products")]
public class Product 
{
    [Column("id")]
    public int Id { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("description")]
    public string Description { get; set; } = string.Empty;
    [Column("category_id")]
    public int CategoryId { get; set; }
    [Column("brand")]
    public string Brand { get; set; } = string.Empty;
    [Column("slug")]
    public string Slug { get; set; } = string.Empty;
    [Column("active")]
    public bool Active { get; set; } = true;
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
    public Category? Category { get; set; }
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
}
