namespace FoodOrder.Domain.Entities;

public class OrderReview
{
    public int Id { get; set; }
    public int OrderId { get; set; }

    /// <summary>1–5 stars</summary>
    public int Rating { get; set; }

    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
