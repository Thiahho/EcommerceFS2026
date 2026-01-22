using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize]
[Route("api/admin/catalog")]
public class CatalogAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CatalogAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetCatalog(CancellationToken cancellationToken)
    {
        var products = await _dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Variants)
            .OrderBy(product => product.Name)
            .Select(product => new AdminCatalogProductDto(
                product.Id,
                product.Name,
                product.Description,
                product.Brand,
                product.Slug,
                product.Active,
                product.Category == null
                    ? null
                    : new AdminCatalogCategoryDto(
                        product.Category.Id,
                        product.Category.Name,
                        product.Category.Slug,
                        product.Category.Active),
                product.Variants
                    .OrderByDescending(variant => variant.Active)
                    .ThenBy(variant => variant.Sku)
                    .Select(variant => new AdminCatalogVariantDto(
                        variant.Id,
                        variant.Color,
                        variant.Ram,
                        variant.Storage,
                        variant.Sku,
                        variant.Price,
                        variant.StockActual,
                        variant.StockReserved,
                        variant.ImagePublicId,
                        variant.Active))
                    .ToList()))
            .ToListAsync(cancellationToken);

        return Ok(products);
    }
}
