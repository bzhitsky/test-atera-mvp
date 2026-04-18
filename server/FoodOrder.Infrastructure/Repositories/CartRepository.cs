using System.Text.Json;
using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class CartRepository(AppDbContext db) : ICartRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task<IReadOnlyList<CartItemDto>?> GetItemsAsync(int userId, CancellationToken ct = default)
    {
        var cart = await db.UserCarts.FirstOrDefaultAsync(c => c.UserId == userId, ct);
        if (cart is null) return null;

        return JsonSerializer.Deserialize<List<CartItemDto>>(cart.ItemsJson, JsonOptions)
               ?? [];
    }

    public async Task SaveItemsAsync(int userId, IReadOnlyList<CartItemDto> items, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(items, JsonOptions);
        var cart = await db.UserCarts.FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart is null)
        {
            db.UserCarts.Add(new UserCart
            {
                UserId = userId,
                ItemsJson = json,
                UpdatedAt = DateTime.UtcNow,
            });
        }
        else
        {
            cart.ItemsJson = json;
            cart.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
    }
}
