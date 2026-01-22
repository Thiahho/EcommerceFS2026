namespace EcommerceFS2026.Api.Models;

public record PromotionDto(
    int Id,
    string Name,
    string Description,
    decimal Value,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt
);
