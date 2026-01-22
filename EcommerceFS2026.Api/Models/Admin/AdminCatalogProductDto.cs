namespace EcommerceFS2026.Api.Models.Admin;

public record AdminCatalogProductDto(
    Guid Id,
    string Name,
    string Description,
    string Brand,
    string Slug,
    bool Active,
    AdminCatalogCategoryDto? Category,
    List<AdminCatalogVariantDto> Variants,
    List<AdminCatalogImageDto> Images);

public record AdminCatalogCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    bool Active);

public record AdminCatalogVariantDto(
    Guid Id,
    string Color,
    string Ram,
    string Storage,
    string Sku,
    decimal Price,
    int StockActual,
    int StockReserved,
    bool Active);

public record AdminCatalogImageDto(
    Guid Id,
    string Url,
    int Order,
    string? AltText,
    string? PublicId);
