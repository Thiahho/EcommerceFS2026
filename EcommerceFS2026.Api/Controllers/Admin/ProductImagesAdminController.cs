using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/images")]
public class ProductImagesAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ProductImagesAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("product/{productId:guid}")]
    public async Task<IActionResult> Create(Guid productId, AdminProductImageRequest request, CancellationToken cancellationToken)
    {
        var productExists = await _dbContext.Products
            .AnyAsync(product => product.Id == productId, cancellationToken);

        if (!productExists)
        {
            return BadRequest("El producto indicado no existe.");
        }

        var image = new ProductImage
        {
            ProductId = productId,
            Url = request.Url,
            Order = request.Order,
            AltText = request.AltText,
            PublicId = request.PublicId
        };

        _dbContext.ProductImages.Add(image);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = image.Id }, image);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var image = await _dbContext.ProductImages
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (image is null)
        {
            return NotFound();
        }

        return Ok(image);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, AdminProductImageRequest request, CancellationToken cancellationToken)
    {
        var image = await _dbContext.ProductImages
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (image is null)
        {
            return NotFound();
        }

        image.Url = request.Url;
        image.Order = request.Order;
        image.AltText = request.AltText;
        image.PublicId = request.PublicId;
        image.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(image);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var image = await _dbContext.ProductImages
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (image is null)
        {
            return NotFound();
        }

        _dbContext.ProductImages.Remove(image);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
