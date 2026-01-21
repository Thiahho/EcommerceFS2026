namespace EcommerceFS2026.Api.Models;

public record ProductCatalogItemDto(
    Guid Id,
    string Name,
    string Brand,
    string Slug,
    string Category,
    decimal MinPrice,
    bool HasStock,
    bool HasActivePromotion
);
