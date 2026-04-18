using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default);
}
