namespace EcommerceFS2026.Api.Models;

public record ProductImageDto(
    Guid Id,
    string Url,
    int Order,
    string? AltText
);
