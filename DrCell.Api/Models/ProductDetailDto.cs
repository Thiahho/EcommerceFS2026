namespace DrCell.Api.Models;

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Description,
    string Brand,
    string Slug,
    string Category,
    bool Active,
    IReadOnlyCollection<ProductImageDto> Images,
    IReadOnlyCollection<ProductVariantDto> Variants
);
