namespace FoodOrder.Application.DTOs;

public record ProductDto(
    int Id,
    int CategoryId,
    string Name,
    string? Description,
    string? ImageUrl,
    decimal Price,
    int? WeightGrams,
    int? Calories,
    string[] Tags,
    bool HasSizes
);

public record ProductSizeDto(int Id, string Label, decimal PriceDelta, int? WeightGrams);

public record ProductAddonDto(int Id, string Name, decimal Price, string? ImageUrl);

public record ProductIngredientDto(int Id, string Name);

public record ProductDetailDto(
    int Id,
    int CategoryId,
    string Name,
    string? Description,
    string? ImageUrl,
    decimal Price,
    int? WeightGrams,
    int? Calories,
    string[] Tags,
    IReadOnlyList<ProductSizeDto> Sizes,
    IReadOnlyList<ProductAddonDto> Addons,
    IReadOnlyList<ProductIngredientDto> Ingredients,
    IReadOnlyList<ProductDto> Recommendations
);
