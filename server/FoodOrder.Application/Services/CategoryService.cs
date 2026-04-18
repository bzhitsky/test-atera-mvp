using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;

namespace FoodOrder.Application.Services;

public class CategoryService(ICategoryRepository repo) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await repo.GetAllAsync(ct);
        return categories.Select(c => new CategoryDto(c.Id, c.Name, c.ImageUrl, c.SortOrder)).ToList();
    }
}
