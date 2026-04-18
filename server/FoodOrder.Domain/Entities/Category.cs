namespace FoodOrder.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }

    public ICollection<Product> Products { get; set; } = [];
}
