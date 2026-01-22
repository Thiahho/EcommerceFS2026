using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("promotion_products")]
public class PromotionProduct
{
    [Column("promotion_id")]
    public int PromotionId { get; set; }
    [Column("product_id")]
    public int ProductId { get; set; }

    public Promotion? Promotion { get; set; }
    public Product? Product { get; set; }
}
