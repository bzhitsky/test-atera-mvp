namespace FoodOrder.Domain.Entities;

public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }

    /// <summary>Short human label, e.g. "Домой", "Работа"</summary>
    public string? Label { get; set; }

    public string Street { get; set; } = string.Empty;
    public string? Apartment { get; set; }
    public string? Entrance { get; set; }
    public string? Floor { get; set; }
    public string? Intercom { get; set; }
    public string? Comment { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = [];
}
