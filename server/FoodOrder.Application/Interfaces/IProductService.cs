using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(int? categoryId, string? search, CancellationToken ct = default);
    Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetPopularAsync(int count = 6, CancellationToken ct = default);
}
