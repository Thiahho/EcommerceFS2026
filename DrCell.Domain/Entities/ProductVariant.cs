namespace DrCell.Domain.Entities;

public class ProductVariant : Entity
{
    public Guid ProductId { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Ram { get; set; } = string.Empty;
    public string Storage { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockActual { get; set; }
    public int StockReserved { get; set; }
    public bool Active { get; set; } = true;

    public Product? Product { get; set; }
    public ICollection<StockReservation> StockReservations { get; set; } = new List<StockReservation>();
}
