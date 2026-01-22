using EcommerceFS2026.Api.Models;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ProductsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetCatalog(
        [FromQuery] string? brand,
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? hasPromotion,
        [FromQuery] bool? inStock,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var query = _dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Variants)
            .Include(product => product.PromotionProducts)
            .ThenInclude(promotionProduct => promotionProduct.Promotion)
            .Where(product => product.Active);

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(product => product.Brand == brand);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(product => product.Category != null && product.Category.Slug == category);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(product => product.Variants.Any(variant => variant.Price >= minPrice.Value));
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(product => product.Variants.Any(variant => variant.Price <= maxPrice.Value));
        }

        if (inStock.HasValue && inStock.Value)
        {
            query = query.Where(product => product.Variants.Any(variant => variant.StockActual - variant.StockReserved > 0));
        }

        if (hasPromotion.HasValue && hasPromotion.Value)
        {
            query = query.Where(product =>
                product.PromotionProducts.Any(pp =>
                    pp.Promotion != null
                    && pp.Promotion.Active
                    && pp.Promotion.StartsAt <= now
                    && pp.Promotion.EndsAt >= now));
        }

        var products = await query
            .Select(product => new ProductCatalogItemDto(
                product.Id,
                product.Name,
                product.Brand,
                product.Slug,
                product.Category != null ? product.Category.Name : string.Empty,
                product.Variants.Count == 0 ? 0 : product.Variants.Min(variant => variant.Price),
                product.Variants.Any(variant => variant.StockActual - variant.StockReserved > 0),
                product.PromotionProducts.Any(pp =>
                    pp.Promotion != null
                    && pp.Promotion.Active
                    && pp.Promotion.StartsAt <= now
                    && pp.Promotion.EndsAt >= now),
                product.Variants
                    .Where(v => v.Active && v.ImagePublicId != null)
                    .Select(v => v.ImagePublicId)
                    .FirstOrDefault()))
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(item => item.Category)
            .Include(item => item.Variants)
            .FirstOrDefaultAsync(item => item.Slug == slug && item.Active, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        var detail = new ProductDetailDto(
            product.Id,
            product.Name,
            product.Description,
            product.Brand,
            product.Slug,
            product.Category?.Name ?? string.Empty,
            product.Active,
            product.Variants
                .Where(variant => variant.Active)
                .Select(variant => new ProductVariantDto(
                    variant.Id,
                    variant.Color,
                    variant.Ram,
                    variant.Storage,
                    variant.Sku,
                    variant.Price,
                    variant.StockActual,
                    variant.StockReserved,
                    variant.Active,
                    variant.ImagePublicId))
                .ToList());

        return Ok(detail);
    }

    [HttpGet("{id:int}/variants")]
    public async Task<IActionResult> GetVariants(int id, CancellationToken cancellationToken)
    {
        var variants = await _dbContext.ProductVariants
            .AsNoTracking()
            .Where(variant => variant.ProductId == id && variant.Active)
            .Select(variant => new ProductVariantDto(
                variant.Id,
                variant.Color,
                variant.Ram,
                variant.Storage,
                variant.Sku,
                variant.Price,
                variant.StockActual,
                variant.StockReserved,
                variant.Active,
                variant.ImagePublicId))
            .ToListAsync(cancellationToken);

        return Ok(variants);
    }
}
