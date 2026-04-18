namespace FoodOrder.Application.DTOs;

public record CartItemSyncRequest(
    int ProductId,
    int? SizeId,
    int[] AddonIds,
    string[] RemovedIngredients,
    int Quantity,
    decimal UnitPrice
);

public record SaveCartRequest(IReadOnlyList<CartItemSyncRequest> Items);

public record CartItemDto(
    int ProductId,
    int? SizeId,
    int[] AddonIds,
    string[] RemovedIngredients,
    int Quantity,
    decimal UnitPrice
);

public record CartDto(IReadOnlyList<CartItemDto> Items, decimal Total);

public record CartValidateRequest(IReadOnlyList<CartItemSyncRequest> Items);

public record CartItemValidation(
    int ProductId,
    int? SizeId,
    int[] AddonIds,
    bool IsAvailable,
    decimal ActualUnitPrice,
    bool PriceChanged
);

public record CartValidateResponse(
    bool IsValid,
    IReadOnlyList<CartItemValidation> Items
);
