namespace EcommerceFS2026.Api.Models;

public record ProductDetailDto(
    int Id,
    string Name,
    string Description,
    string Brand,
    string Slug,
    string Category,
    bool Active,
    bool HasActivePromotion,
    int? ActivePromotionType,
    decimal? ActivePromotionValue,
    IReadOnlyCollection<ProductVariantDto> Variants
);
