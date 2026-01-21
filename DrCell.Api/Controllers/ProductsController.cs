using DrCell.Api.Models;
using DrCell.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrCell.Api.Controllers;

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
                    && pp.Promotion.EndsAt >= now)))
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(item => item.Category)
            .Include(item => item.Images)
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
            product.Images
                .OrderBy(image => image.Order)
                .Select(image => new ProductImageDto(
                    image.Id,
                    image.Url,
                    image.Order,
                    image.AltText))
                .ToList(),
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
                    variant.StockReserved))
                .ToList());

        return Ok(detail);
    }

    [HttpGet("{id:guid}/variants")]
    public async Task<IActionResult> GetVariants(Guid id, CancellationToken cancellationToken)
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
                variant.StockReserved))
            .ToListAsync(cancellationToken);

        return Ok(variants);
    }
}
