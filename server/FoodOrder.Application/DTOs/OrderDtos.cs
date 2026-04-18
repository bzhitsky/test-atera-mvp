namespace FoodOrder.Application.DTOs;

public record OrderItemDto(
    int Id,
    int ProductId,
    string ProductName,
    string? ImageUrl,
    string? SizeLabel,
    int Quantity,
    decimal UnitPrice,
    string[] Addons,
    string[] RemovedIngredients
);

public record OrderReviewDto(int Id, int Rating, string? Comment, DateTime CreatedAt);

public record OrderStatusHistoryDto(string Status, string? Note, DateTime OccurredAt);

public record OrderDto(
    int Id,
    string Status,
    string Type,
    string PaymentMethod,
    AddressDto? Address,
    DateTime? RequestedAt,
    decimal Total,
    string? Comment,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    OrderReviewDto? Review,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistory
);

public record CreateOrderItemRequest(
    int ProductId,
    int? SizeId,
    string? SizeLabel,
    int[] AddonIds,
    string[] RemovedIngredients,
    int Quantity
);

public record CreateOrderRequest(
    string Type,
    string PaymentMethod,
    int? AddressId,
    DateTime? RequestedAt,
    string? Comment,
    IReadOnlyList<CreateOrderItemRequest> Items
);

public record CreateReviewRequest(int Rating, string? Comment);

public record UpdateOrderStatusRequest(string Status, string? Note);
