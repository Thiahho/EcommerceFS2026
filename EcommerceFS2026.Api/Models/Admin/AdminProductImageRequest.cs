namespace EcommerceFS2026.Api.Models.Admin;

public record AdminProductImageRequest(
    string Url,
    int Order,
    string? AltText,
    string? PublicId);
