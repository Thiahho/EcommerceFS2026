using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize]
[Route("api/admin/promotions")]
public class PromotionsAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public PromotionsAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var promotions = await _dbContext.Promotions
            .AsNoTracking()
            .OrderByDescending(promotion => promotion.StartsAt)
            .ToListAsync(cancellationToken);

        return Ok(promotions);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> Create(AdminPromotionRequest request, CancellationToken cancellationToken)
    {
        var promotion = new Promotion
        {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Value = request.Value,
            Code = request.Code,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            Active = request.Active,
            Combinable = request.Combinable
        };

        _dbContext.Promotions.Add(promotion);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = promotion.Id }, promotion);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> Update(int id, AdminPromotionRequest request, CancellationToken cancellationToken)
    {
        var promotion = await _dbContext.Promotions
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (promotion is null)
        {
            return NotFound();
        }

        promotion.Name = request.Name;
        promotion.Description = request.Description;
        promotion.Type = request.Type;
        promotion.Value = request.Value;
        promotion.Code = request.Code;
        promotion.StartsAt = request.StartsAt;
        promotion.EndsAt = request.EndsAt;
        promotion.Active = request.Active;
        promotion.Combinable = request.Combinable;
        promotion.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(promotion);
    }

    [HttpPost("{id:int}/products")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> AssignProduct(int id, AdminAssignPromotionProductRequest request, CancellationToken cancellationToken)
    {
        var promotionExists = await _dbContext.Promotions
            .AnyAsync(promotion => promotion.Id == id, cancellationToken);
        var productExists = await _dbContext.Products
            .AnyAsync(product => product.Id == request.ProductId, cancellationToken);

        if (!promotionExists || !productExists)
        {
            return BadRequest("La promoción o el producto indicado no existe.");
        }

        var alreadyAssigned = await _dbContext.PromotionProducts
            .AnyAsync(pp => pp.PromotionId == id && pp.ProductId == request.ProductId, cancellationToken);

        if (alreadyAssigned)
        {
            return Ok();
        }

        _dbContext.PromotionProducts.Add(new PromotionProduct
        {
            PromotionId = id,
            ProductId = request.ProductId
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok();
    }

    [HttpDelete("{id:int}/products/{productId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveProduct(int id, int productId, CancellationToken cancellationToken)
    {
        var relation = await _dbContext.PromotionProducts
            .FirstOrDefaultAsync(pp => pp.PromotionId == id && pp.ProductId == productId, cancellationToken);

        if (relation is null)
        {
            return NotFound();
        }

        _dbContext.PromotionProducts.Remove(relation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
