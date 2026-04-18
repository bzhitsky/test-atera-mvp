namespace FoodOrder.Domain.Entities;

public class UserCart
{
    public int UserId { get; set; }
    public string ItemsJson { get; set; } = "[]";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
