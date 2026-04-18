namespace FoodOrder.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    /// <summary>Base price (size S or no-size variant)</summary>
    public decimal Price { get; set; }

    public int? WeightGrams { get; set; }
    public int? Calories { get; set; }

    /// <summary>Comma-separated tags, e.g. "Говядина,Острое"</summary>
    public string? Tags { get; set; }

    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<ProductSize> Sizes { get; set; } = [];
    public ICollection<ProductAddon> Addons { get; set; } = [];
    public ICollection<ProductIngredient> Ingredients { get; set; } = [];
}
