namespace FoodOrder.Domain.Entities;

public enum OrderStatus
{
    Pending,
    Accepted,
    Preparing,
    OnTheWay,
    Delivered,
    Cancelled,
    Delayed
}

public enum OrderType
{
    Delivery,
    Pickup
}

public enum PaymentMethod
{
    SBP,
    Card,
    Cash
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? AddressId { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public OrderType Type { get; set; }
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>Requested delivery/pickup time slot, null = ASAP</summary>
    public DateTime? RequestedAt { get; set; }

    public decimal Total { get; set; }
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Address? Address { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
    public OrderReview? Review { get; set; }
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = [];
}
