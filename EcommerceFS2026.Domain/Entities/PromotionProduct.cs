using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("promotion_products")]
public class PromotionProduct
{
    [Column("promotion_id")]
    public Guid PromotionId { get; set; }

    [Column("product_id")]
    public Guid ProductId { get; set; }

    public Promotion? Promotion { get; set; }
    public Product? Product { get; set; }
}
