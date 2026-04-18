using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
}
