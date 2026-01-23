namespace EcommerceFS2026.Api.Models.Admin;

public class AdminStockVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Ram { get; set; } = string.Empty;
    public string Storage { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public int StockReserved { get; set; }
    public bool Active { get; set; }
}
