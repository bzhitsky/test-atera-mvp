namespace FoodOrder.Domain.Entities;

public class ProductSize
{
    public int Id { get; set; }
    public int ProductId { get; set; }

    /// <summary>e.g. "S", "M", "L"</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Price difference relative to base product price (can be negative)</summary>
    public decimal PriceDelta { get; set; }

    public int? WeightGrams { get; set; }
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
}
