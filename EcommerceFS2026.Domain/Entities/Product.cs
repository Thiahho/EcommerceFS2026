using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("products")]
public class Product : Entity
{
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("brand")]
    public string Brand { get; set; } = string.Empty;

    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("slug")]
    public string Slug { get; set; } = string.Empty;

    [Column("active")]
    public bool Active { get; set; } = true;

    public Category? Category { get; set; }
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
}
