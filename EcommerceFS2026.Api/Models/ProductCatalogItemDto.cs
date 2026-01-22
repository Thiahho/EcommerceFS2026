namespace EcommerceFS2026.Api.Models;

public record ProductCatalogItemDto(
    int Id,
    string Name,
    string Brand,
    string Slug,
    string Category,
    decimal MinPrice,
    bool HasStock,
    bool HasActivePromotion,
    string? ImagePublicId
);
