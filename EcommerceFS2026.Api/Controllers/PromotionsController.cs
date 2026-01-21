using EcommerceFS2026.Api.Models;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/promotions")]
public class PromotionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public PromotionsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetActivePromotions(CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var promotions = await _dbContext.Promotions
            .AsNoTracking()
            .Where(promotion => promotion.Active && promotion.StartsAt <= now && promotion.EndsAt >= now)
            .Select(promotion => new PromotionDto(
                promotion.Id,
                promotion.Name,
                promotion.Description,
                promotion.Value,
                promotion.StartsAt,
                promotion.EndsAt))
            .ToListAsync(cancellationToken);

        return Ok(promotions);
    }
}
