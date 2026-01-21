namespace EcommerceFS2026.Domain.Entities;

public class ProductImage : Entity
{
    public Guid ProductId { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public string? AltText { get; set; }
    public string? PublicId { get; set; }

    public Product? Product { get; set; }
}
