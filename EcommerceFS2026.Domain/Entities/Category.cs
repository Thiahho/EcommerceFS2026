using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("categories")]
public class Category : Entity
{
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("slug")]
    public string Slug { get; set; } = string.Empty;

    [Column("active")]
    public bool Active { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
