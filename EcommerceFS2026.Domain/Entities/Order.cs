using EcommerceFS2026.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("orders")]
public class Order : Entity
{
    [Column("id")]
    public Guid Id{get;set;}
    
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [Column("customer_email")]
    public string CustomerEmail { get; set; } = string.Empty;

    [Column("customer_phone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Column("customer_dni")]
    public string CustomerDni { get; set; } = string.Empty;

    [Column("shipping_address")]
    public string ShippingAddress { get; set; } = string.Empty;

    [Column("shipping_city")]
    public string ShippingCity { get; set; } = string.Empty;

    [Column("shipping_postal_code")]
    public string ShippingPostalCode { get; set; } = string.Empty;

    [Column("status")]
    public OrderStatus Status { get; set; } = OrderStatus.PendingPayment;

    [Column("currency")]
    public string Currency { get; set; } = "ARS";

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [Column("payment_provider")]
    public string? PaymentProvider { get; set; }

    [Column("payment_status")]
    public string? PaymentStatus { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<StockReservation> StockReservations { get; set; } = new List<StockReservation>();
}
