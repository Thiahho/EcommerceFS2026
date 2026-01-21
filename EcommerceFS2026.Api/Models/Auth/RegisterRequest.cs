namespace EcommerceFS2026.Api.Models.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Role);
