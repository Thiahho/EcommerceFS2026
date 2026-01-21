namespace EcommerceFS2026.Api.Models;

public record PromotionDto(
    Guid Id,
    string Name,
    string Description,
    decimal Value,
    DateTimeOffset CreatedAt,
    DateTimeOffset EndsAt
);
