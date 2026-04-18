namespace FoodOrder.Domain.Entities;

public class ProductAddon
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
}
