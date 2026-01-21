namespace EcommerceFS2026.Api.Models;

public record ProductVariantDto(
    Guid Id,
    string Color,
    string Ram,
    string Storage,
    string Sku,
    decimal Price,
    int StockActual,
    int StockReserved
);
