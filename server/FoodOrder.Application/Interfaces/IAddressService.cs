using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> GetAddressesAsync(int userId, CancellationToken ct = default);
    Task<AddressDto> CreateAddressAsync(int userId, UpsertAddressRequest request, CancellationToken ct = default);
    Task<AddressDto> UpdateAddressAsync(int id, int userId, UpsertAddressRequest request, CancellationToken ct = default);
    Task DeleteAddressAsync(int id, int userId, CancellationToken ct = default);
}
