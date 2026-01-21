namespace EcommerceFS2026.Domain.Entities;

public class PromotionProduct
{
    public Guid PromotionId { get; set; }
    public Guid ProductId { get; set; }

    public Promotion? Promotion { get; set; }
    public Product? Product { get; set; }
}
