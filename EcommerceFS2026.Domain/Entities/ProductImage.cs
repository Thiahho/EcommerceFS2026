using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("product_images")]
public class ProductImage : Entity
{
    [Column("id")]
    public Guid ProductId { get; set; }
    [Column("url")]
    public string Url { get; set; } = string.Empty;
    [Column("order")]
    public int Order { get; set; }
    [Column("alt_text")]
    public string? AltText { get; set; }
    [Column("public_id")]
    public string? PublicId { get; set; }
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    public Product? Product { get; set; }
}
