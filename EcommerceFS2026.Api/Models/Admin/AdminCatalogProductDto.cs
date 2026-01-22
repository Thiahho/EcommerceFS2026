namespace EcommerceFS2026.Api.Models.Admin;

public record AdminCatalogProductDto(
    int Id,
    string Name,
    string Description,
    string Brand,
    string Slug,
    bool Active,
    AdminCatalogCategoryDto? Category,
    List<AdminCatalogVariantDto> Variants);

public record AdminCatalogCategoryDto(
    int Id,
    string Name,
    string Slug,
    bool Active);

public record AdminCatalogVariantDto(
    int Id,
    string Color,
    string Ram,
    string Storage,
    string Sku,
    decimal Price,
    int StockActual,
    int StockReserved,
    string? ImagePublicId,
    bool Active);
