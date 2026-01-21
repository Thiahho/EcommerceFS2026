namespace EcommerceFS2026.Api.Models.Admin;

public record AdminCategoryRequest(
    string Name,
    string Slug,
    bool Active);
