namespace EcommerceFS2026.Api.Models.Checkout;

public record CreateOrderRequest(
    string FullName,
    string Email,
    string Phone,
    string Dni,
    string Address,
    string City,
    string PostalCode,
    List<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(
    int ProductVariantId,
    string ProductName,
    decimal UnitPrice,
    int Quantity);
