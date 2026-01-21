namespace EcommerceFS2026.Entities;

public class Product : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public bool Active { get; set; } = true;

    public Category? Category { get; set; }
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
}
