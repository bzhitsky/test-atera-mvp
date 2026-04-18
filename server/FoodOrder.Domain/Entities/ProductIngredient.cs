namespace FoodOrder.Domain.Entities;

/// <summary>
/// Ingredient that can be removed from a product by the customer.
/// E.g. "Лук", "Огурец", "Соус тартар"
/// </summary>
public class ProductIngredient
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
}
