using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Controllers;

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
    public async Task<IActionResult> GetCatalog(CancellationToken cancellationToken)
    {
        var products = await _dbContext.Products
            .AsNoTracking()
            .Where(product => product.Active)
            .Select(product => new
            {
                product.Id,
                product.Name,
                product.Brand,
                product.Slug
            })
            .ToListAsync(cancellationToken);

        return Ok(products);
    }
}
