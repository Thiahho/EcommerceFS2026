namespace EcommerceFS2026.Api.Models.Admin;

public class AdminProductDto
{
   public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public bool Active { get; set; }
}
