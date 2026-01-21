namespace EcommerceFS2026.Entities;

public class Category : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool Active { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
