using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetAllAsync(
        int? categoryId, string? search, CancellationToken ct = default)
    {
        var query = db.Products
            .Include(p => p.Sizes)
            .Where(p => p.IsAvailable);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{search}%"));

        return await query.OrderBy(p => p.SortOrder).ToListAsync(ct);
    }

    public async Task<Product?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Products
            .Include(p => p.Sizes)
            .Include(p => p.Addons)
            .Include(p => p.Ingredients)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Product>> GetPopularAsync(int count, CancellationToken ct = default) =>
        await db.Products
            .Include(p => p.Sizes)
            .Where(p => p.IsAvailable)
            .OrderBy(p => p.SortOrder)
            .Take(count)
            .ToListAsync(ct);
}
