using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize]
[Route("api/admin/variants")]
public class ProductVariantsAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ProductVariantsAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("product/{productId:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> Create(int productId, AdminProductVariantRequest request, CancellationToken cancellationToken)
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
            Active = request.Active,
            ImagePublicId = request.ImagePublicId
        };

        _dbContext.ProductVariants.Add(variant);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = variant.Id }, variant);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
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

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> Update(int id, AdminProductVariantRequest request, CancellationToken cancellationToken)
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
        variant.ImagePublicId = request.ImagePublicId;
        variant.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(variant);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
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

    [HttpPatch("{id:int}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Activate(int id, CancellationToken cancellationToken)
    {
        var variant = await _dbContext.ProductVariants
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (variant is null)
        {
            return NotFound();
        }

        variant.Active = true;
        variant.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(variant);
    }

    [HttpGet("product/{productId:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken)
    {
        var variants = await _dbContext.ProductVariants
            .AsNoTracking()
            .Where(variant => variant.ProductId == productId)
            .OrderByDescending(variant => variant.Active)
            .ThenBy(variant => variant.Sku)
            .ToListAsync(cancellationToken);

        return Ok(variants);
    }
}
