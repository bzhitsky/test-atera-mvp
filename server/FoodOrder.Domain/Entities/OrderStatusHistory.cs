namespace FoodOrder.Domain.Entities;

/// <summary>Audit trail of order status changes — used for real-time tracking UI</summary>
public class OrderStatusHistory
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public string? Note { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
