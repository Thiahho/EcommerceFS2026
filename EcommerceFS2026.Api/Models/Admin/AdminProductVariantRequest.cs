namespace EcommerceFS2026.Api.Models.Admin;

public record AdminProductVariantRequest(
    string Color,
    string Ram,
    string Storage,
    string Sku,
    decimal Price,
    int StockActual,
    int StockReserved,
    bool Active);
