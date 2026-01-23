namespace EcommerceFS2026.Api.Models.Admin;

public class AdminOrderListDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public int ItemsCount { get; set; }
}
