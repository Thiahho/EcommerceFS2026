using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/variants")]
public class ProductVariantsAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ProductVariantsAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("product/{productId:guid}")]
    public async Task<IActionResult> Create(Guid productId, AdminProductVariantRequest request, CancellationToken cancellationToken)
    {
        var productExists = await _dbContext.Products
            .AnyAsync(product => product.Id == productId, cancellationToken);

        if (!productExists)
        {
            return BadRequest("El producto indicado no existe.");
        }

        var variant = new ProductVariant
        {
            ProductId = productId,
            Color = request.Color,
            Ram = request.Ram,
            Storage = request.Storage,
            Sku = request.Sku,
            Price = request.Price,
            StockActual = request.StockActual,
            StockReserved = request.StockReserved,
            Active = request.Active
        };

        _dbContext.ProductVariants.Add(variant);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = variant.Id }, variant);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var variant = await _dbContext.ProductVariants
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (variant is null)
        {
            return NotFound();
        }

        return Ok(variant);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, AdminProductVariantRequest request, CancellationToken cancellationToken)
    {
        var variant = await _dbContext.ProductVariants
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (variant is null)
        {
            return NotFound();
        }

        variant.Color = request.Color;
        variant.Ram = request.Ram;
        variant.Storage = request.Storage;
        variant.Sku = request.Sku;
        variant.Price = request.Price;
        variant.StockActual = request.StockActual;
        variant.StockReserved = request.StockReserved;
        variant.Active = request.Active;
        variant.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(variant);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var variant = await _dbContext.ProductVariants
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (variant is null)
        {
            return NotFound();
        }

        variant.Active = false;
        variant.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
