using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface ICartRepository
{
    Task<IReadOnlyList<CartItemDto>?> GetItemsAsync(int userId, CancellationToken ct = default);
    Task SaveItemsAsync(int userId, IReadOnlyList<CartItemDto> items, CancellationToken ct = default);
}
