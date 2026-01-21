namespace DrCell.Api.Models;

public record PromotionDto(
    Guid Id,
    string Name,
    string Description,
    decimal Value,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt
);
