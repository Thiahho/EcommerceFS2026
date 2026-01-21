using System.ComponentModel.DataAnnotations.Schema;
using System.Xml;

namespace EcommerceFS2026.Domain.Entities;

[Table("categories")]
public class Category : Entity
{

    [Column("id")]
    public Guid Id { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("slug")]
    public string Slug { get; set; } = string.Empty;
    [Column("active")]
    public bool Active { get; set; } = true;
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
