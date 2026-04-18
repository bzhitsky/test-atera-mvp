using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId, CancellationToken ct = default);
    Task<CartDto> SaveCartAsync(int userId, IReadOnlyList<CartItemSyncRequest> items, CancellationToken ct = default);
    Task<CartValidateResponse> ValidateCartAsync(IReadOnlyList<CartItemSyncRequest> items, CancellationToken ct = default);
}
