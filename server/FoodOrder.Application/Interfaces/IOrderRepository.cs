using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<Order> CreateAsync(Order order, CancellationToken ct = default);
    Task UpdateStatusAsync(int orderId, OrderStatus status, string? note = null, CancellationToken ct = default);
    Task<OrderReview?> GetReviewAsync(int orderId, CancellationToken ct = default);
    Task CreateReviewAsync(OrderReview review, CancellationToken ct = default);
}
