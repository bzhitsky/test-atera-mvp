using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByPhoneAsync(string phone, CancellationToken ct = default);
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<User> CreateAsync(User user, CancellationToken ct = default);
    Task UpdateAsync(User user, CancellationToken ct = default);
}
