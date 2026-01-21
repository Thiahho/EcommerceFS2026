namespace EcommerceFS2026.Api.Models.Auth;

public record AuthResponse(
    string Token,
    DateTimeOffset ExpiresAt,
    string Email,
    string Role);
