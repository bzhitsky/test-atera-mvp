using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Services;

public class ProductService(IProductRepository repo) : IProductService
{
    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(
        int? categoryId, string? search, CancellationToken ct = default)
    {
        var products = await repo.GetAllAsync(categoryId, search, ct);
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await repo.GetByIdAsync(id, ct);
        if (p is null) return null;

        var recommendations = await repo.GetPopularAsync(7, ct);

        return new ProductDetailDto(
            p.Id, p.CategoryId, p.Name, p.Description, p.ImageUrl,
            p.Price, p.WeightGrams, p.Calories,
            ParseTags(p.Tags),
            p.Sizes.OrderBy(s => s.SortOrder).Select(s => new ProductSizeDto(s.Id, s.Label, s.PriceDelta, s.WeightGrams)).ToList(),
            p.Addons.OrderBy(a => a.SortOrder).Select(a => new ProductAddonDto(a.Id, a.Name, a.Price, a.ImageUrl)).ToList(),
            p.Ingredients.OrderBy(i => i.SortOrder).Select(i => new ProductIngredientDto(i.Id, i.Name)).ToList(),
            recommendations.Where(r => r.Id != id).Take(6).Select(ToDto).ToList()
        );
    }

    public async Task<IReadOnlyList<ProductDto>> GetPopularAsync(int count = 6, CancellationToken ct = default)
    {
        var products = await repo.GetPopularAsync(count, ct);
        return products.Select(ToDto).ToList();
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.CategoryId, p.Name, p.Description, p.ImageUrl,
        p.Price, p.WeightGrams, p.Calories,
        ParseTags(p.Tags),
        p.Sizes.Count != 0
    );

    private static string[] ParseTags(string? tags) =>
        string.IsNullOrWhiteSpace(tags)
            ? []
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
