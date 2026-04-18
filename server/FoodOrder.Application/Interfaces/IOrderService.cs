using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto?> GetOrderAsync(int id, int userId, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetUserOrdersAsync(int userId, CancellationToken ct = default);
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, int userId, CancellationToken ct = default);
    Task<OrderDto> UpdateStatusAsync(int orderId, string status, string? note, CancellationToken ct = default);
    Task<OrderReviewDto> CreateReviewAsync(int orderId, int userId, CreateReviewRequest request, CancellationToken ct = default);
}
