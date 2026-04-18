using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync(int? categoryId, string? search, CancellationToken ct = default);
    Task<Product?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetPopularAsync(int count, CancellationToken ct = default);
}
