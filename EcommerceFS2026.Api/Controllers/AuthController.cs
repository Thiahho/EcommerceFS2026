using EcommerceFS2026.Api.Models.Auth;
using EcommerceFS2026.Api.Services;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Admin",
        "Vendedor",
        "Cliente"
    };

    private readonly AppDbContext _dbContext;
    private readonly JwtTokenService _tokenService;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(
        AppDbContext dbContext,
        JwtTokenService tokenService,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var role = string.IsNullOrWhiteSpace(request.Role) ? "Admin" : request.Role.Trim();

        if (!AllowedRoles.Contains(role))
        {
            return BadRequest("El rol indicado no es válido.");
        }

        var exists = await _dbContext.Users
            .AnyAsync(user => user.Email == normalizedEmail, cancellationToken);

        if (exists)
        {
            return BadRequest("El email ya está registrado.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            Role = role,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Register), new { id = user.Id }, new
        {
            user.Id,
            user.Email,
            user.Role
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.Active, cancellationToken);

        if (user is null)
        {
            return Unauthorized("Credenciales inválidas.");
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Credenciales inválidas.");
        }

        var (token, expiresAt) = _tokenService.CreateToken(user);

        return Ok(new AuthResponse(token, expiresAt, user.Email, user.Role));
    }
}
