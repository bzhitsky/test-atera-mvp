using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<Order?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Address)
            .Include(o => o.Review)
            .Include(o => o.StatusHistory.OrderByDescending(h => h.OccurredAt))
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetByUserIdAsync(int userId, CancellationToken ct = default) =>
        await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Review)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<Order> CreateAsync(Order order, CancellationToken ct = default)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        return order;
    }

    public async Task UpdateStatusAsync(
        int orderId, OrderStatus status, string? note = null, CancellationToken ct = default)
    {
        var order = await db.Orders.FindAsync([orderId], ct)
            ?? throw new KeyNotFoundException($"Order {orderId} not found");

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;

        db.OrderStatusHistory.Add(new OrderStatusHistory
        {
            OrderId = orderId,
            Status = status,
            Note = note,
        });

        await db.SaveChangesAsync(ct);
    }

    public async Task<OrderReview?> GetReviewAsync(int orderId, CancellationToken ct = default) =>
        await db.OrderReviews.FirstOrDefaultAsync(r => r.OrderId == orderId, ct);

    public async Task CreateReviewAsync(OrderReview review, CancellationToken ct = default)
    {
        db.OrderReviews.Add(review);
        await db.SaveChangesAsync(ct);
    }
}
