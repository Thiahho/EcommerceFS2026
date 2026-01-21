using EcommerceFS2026.Domain.Enums;

namespace EcommerceFS2026.Api.Models.Admin;

public record AdminPromotionRequest(
    string Name,
    string Description,
    PromotionType Type,
    decimal Value,
    string? Code,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool Active,
    bool Combinable);
