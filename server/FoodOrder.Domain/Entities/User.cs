namespace FoodOrder.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Address> Addresses { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
}
