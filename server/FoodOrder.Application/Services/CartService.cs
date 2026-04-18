using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;

namespace FoodOrder.Application.Services;

public class CartService(ICartRepository cartRepo, IProductRepository productRepo) : ICartService
{
    public async Task<CartDto> GetCartAsync(int userId, CancellationToken ct = default)
    {
        var items = await cartRepo.GetItemsAsync(userId, ct) ?? [];
        return ToDto(items);
    }

    public async Task<CartDto> SaveCartAsync(
        int userId,
        IReadOnlyList<CartItemSyncRequest> items,
        CancellationToken ct = default)
    {
        var dtos = items.Select(i => new CartItemDto(
            i.ProductId, i.SizeId, i.AddonIds, i.RemovedIngredients, i.Quantity, i.UnitPrice
        )).ToList();

        await cartRepo.SaveItemsAsync(userId, dtos, ct);
        return ToDto(dtos);
    }

    public async Task<CartValidateResponse> ValidateCartAsync(
        IReadOnlyList<CartItemSyncRequest> items,
        CancellationToken ct = default)
    {
        var validations = new List<CartItemValidation>();
        var overallValid = true;

        foreach (var item in items)
        {
            var product = await productRepo.GetByIdAsync(item.ProductId, ct);

            if (product is null || !product.IsAvailable)
            {
                validations.Add(new CartItemValidation(
                    item.ProductId, item.SizeId, item.AddonIds,
                    IsAvailable: false,
                    ActualUnitPrice: 0,
                    PriceChanged: true
                ));
                overallValid = false;
                continue;
            }

            var actualPrice = product.Price;

            if (item.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == item.SizeId.Value);
                if (size is not null)
                    actualPrice += size.PriceDelta;
            }

            foreach (var addonId in item.AddonIds)
            {
                var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                if (addon is not null)
                    actualPrice += addon.Price;
            }

            var priceChanged = Math.Abs(actualPrice - item.UnitPrice) > 0.01m;
            if (priceChanged) overallValid = false;

            validations.Add(new CartItemValidation(
                item.ProductId, item.SizeId, item.AddonIds,
                IsAvailable: true,
                ActualUnitPrice: actualPrice,
                PriceChanged: priceChanged
            ));
        }

        return new CartValidateResponse(overallValid, validations);
    }

    private static CartDto ToDto(IReadOnlyList<CartItemDto> items)
    {
        var total = items.Sum(i => i.UnitPrice * i.Quantity);
        return new CartDto(items, total);
    }
}
