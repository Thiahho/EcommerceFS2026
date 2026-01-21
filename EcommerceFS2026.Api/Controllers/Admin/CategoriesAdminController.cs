using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Entities;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
public class CategoriesAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CategoriesAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create(AdminCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = request.Name,
            Slug = request.Slug,
            Active = request.Active
        };

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = category.Id }, category);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, AdminCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Active = request.Active;
        category.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        category.Active = false;
        category.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
