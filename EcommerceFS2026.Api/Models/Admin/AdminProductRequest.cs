namespace EcommerceFS2026.Api.Models.Admin;

public record AdminProductRequest(
    string Name,
    string Description,
    string Brand,
    Guid CategoryId,
    string Slug,
    bool Active);
