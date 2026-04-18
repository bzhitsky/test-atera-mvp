using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface IAddressRepository
{
    Task<IReadOnlyList<Address>> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<Address?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Address> CreateAsync(Address address, CancellationToken ct = default);
    Task UpdateAsync(Address address, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
