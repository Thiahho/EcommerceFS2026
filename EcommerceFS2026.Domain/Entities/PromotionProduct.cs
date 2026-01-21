namespace EcommerceFS2026.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema;

[Table("promotion_products")]
public class PromotionProduct
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("promotion_id")]
    public Guid PromotionId { get; set; }
    [Column("product_id")]
    public Guid ProductId { get; set; }

    public Promotion? Promotion { get; set; }
    public Product? Product { get; set; }
}
