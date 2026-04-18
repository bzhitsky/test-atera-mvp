using System.Text.Json;
using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Services;

public class OrderService(IOrderRepository orderRepo, IProductRepository productRepo) : IOrderService
{
    public async Task<OrderDto?> GetOrderAsync(int id, int userId, CancellationToken ct = default)
    {
        var order = await orderRepo.GetByIdAsync(id, ct);
        if (order is null || order.UserId != userId) return null;
        return ToDto(order);
    }

    public async Task<IReadOnlyList<OrderDto>> GetUserOrdersAsync(int userId, CancellationToken ct = default)
    {
        var orders = await orderRepo.GetByUserIdAsync(userId, ct);
        return orders.Select(ToDto).ToList();
    }

    public async Task<OrderDto> CreateOrderAsync(
        CreateOrderRequest request, int userId, CancellationToken ct = default)
    {
        if (!Enum.TryParse<OrderType>(request.Type, out var type))
            throw new ArgumentException($"Unknown order type: {request.Type}");

        if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, out var payment))
            throw new ArgumentException($"Unknown payment method: {request.PaymentMethod}");

        var items = new List<OrderItem>();
        decimal total = 0;

        foreach (var req in request.Items)
        {
            var product = await productRepo.GetByIdAsync(req.ProductId, ct)
                ?? throw new KeyNotFoundException($"Product {req.ProductId} not found");

            decimal sizePrice = 0;
            string? sizeLabel = req.SizeLabel;

            if (req.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == req.SizeId.Value);
                if (size is not null)
                {
                    sizePrice = size.PriceDelta;
                    sizeLabel = size.Label;
                }
            }

            decimal addonPrice = 0;
            var addonNames = new List<string>();

            foreach (var addonId in req.AddonIds)
            {
                var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                if (addon is not null)
                {
                    addonPrice += addon.Price;
                    addonNames.Add(addon.Name);
                }
            }

            var unitPrice = product.Price + sizePrice + addonPrice;

            items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ImageUrl = product.ImageUrl,
                SizeLabel = sizeLabel,
                Quantity = req.Quantity,
                UnitPrice = unitPrice,
                AddonsJson = JsonSerializer.Serialize(addonNames),
                RemovedIngredientsJson = JsonSerializer.Serialize(req.RemovedIngredients),
            });

            total += unitPrice * req.Quantity;
        }

        var order = new Order
        {
            UserId = userId,
            AddressId = request.AddressId,
            Type = type,
            PaymentMethod = payment,
            RequestedAt = request.RequestedAt,
            Comment = request.Comment,
            Total = total,
            Items = items,
            StatusHistory =
            [
                new OrderStatusHistory { Status = OrderStatus.Pending }
            ]
        };

        var created = await orderRepo.CreateAsync(order, ct);
        return ToDto(created);
    }

    public async Task<OrderDto> UpdateStatusAsync(
        int orderId, string status, string? note, CancellationToken ct = default)
    {
        if (!Enum.TryParse<OrderStatus>(status, out var orderStatus))
            throw new ArgumentException($"Unknown order status: {status}");

        await orderRepo.UpdateStatusAsync(orderId, orderStatus, note, ct);
        var order = await orderRepo.GetByIdAsync(orderId, ct)
            ?? throw new KeyNotFoundException($"Order {orderId} not found");

        return ToDto(order);
    }

    public async Task<OrderReviewDto> CreateReviewAsync(
        int orderId, int userId, CreateReviewRequest request, CancellationToken ct = default)
    {
        var order = await orderRepo.GetByIdAsync(orderId, ct)
            ?? throw new KeyNotFoundException($"Order {orderId} not found");

        if (order.UserId != userId)
            throw new UnauthorizedAccessException("Order does not belong to this user");

        if (order.Review is not null)
            throw new InvalidOperationException("Order already has a review");

        if (order.Status != OrderStatus.Delivered)
            throw new InvalidOperationException("Can only review delivered orders");

        var review = new OrderReview
        {
            OrderId = orderId,
            Rating = Math.Clamp(request.Rating, 1, 5),
            Comment = request.Comment,
        };

        await orderRepo.CreateReviewAsync(review, ct);
        return new OrderReviewDto(review.Id, review.Rating, review.Comment, review.CreatedAt);
    }

    private static OrderDto ToDto(Order o) => new(
        o.Id,
        o.Status.ToString(),
        o.Type.ToString(),
        o.PaymentMethod.ToString(),
        o.Address is null ? null : new AddressDto(
            o.Address.Id, o.Address.Label, o.Address.Street, o.Address.Apartment,
            o.Address.Entrance, o.Address.Floor, o.Address.Intercom, o.Address.Comment,
            o.Address.Latitude, o.Address.Longitude),
        o.RequestedAt,
        o.Total,
        o.Comment,
        o.CreatedAt,
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.ProductName, i.ImageUrl, i.SizeLabel, i.Quantity, i.UnitPrice,
            ParseJson(i.AddonsJson),
            ParseJson(i.RemovedIngredientsJson)
        )).ToList(),
        o.Review is null ? null : new OrderReviewDto(o.Review.Id, o.Review.Rating, o.Review.Comment, o.Review.CreatedAt),
        o.StatusHistory.Select(h => new OrderStatusHistoryDto(h.Status.ToString(), h.Note, h.OccurredAt)).ToList()
    );

    private static string[] ParseJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return JsonSerializer.Deserialize<string[]>(json) ?? []; }
        catch { return []; }
    }
}
