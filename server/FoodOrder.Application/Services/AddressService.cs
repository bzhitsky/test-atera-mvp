using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Services;

public class AddressService(IAddressRepository repo) : IAddressService
{
    public async Task<IReadOnlyList<AddressDto>> GetAddressesAsync(int userId, CancellationToken ct = default)
    {
        var list = await repo.GetByUserIdAsync(userId, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<AddressDto> CreateAddressAsync(int userId, UpsertAddressRequest request, CancellationToken ct = default)
    {
        var address = Map(request);
        address.UserId = userId;
        var created = await repo.CreateAsync(address, ct);
        return ToDto(created);
    }

    public async Task<AddressDto> UpdateAddressAsync(int id, int userId, UpsertAddressRequest request, CancellationToken ct = default)
    {
        var existing = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Address {id} not found");

        if (existing.UserId != userId)
            throw new UnauthorizedAccessException("Address does not belong to this user");

        existing.Label = request.Label;
        existing.Street = request.Street;
        existing.Apartment = request.Apartment;
        existing.Entrance = request.Entrance;
        existing.Floor = request.Floor;
        existing.Intercom = request.Intercom;
        existing.Comment = request.Comment;
        existing.Latitude = request.Latitude;
        existing.Longitude = request.Longitude;

        await repo.UpdateAsync(existing, ct);
        return ToDto(existing);
    }

    public async Task DeleteAddressAsync(int id, int userId, CancellationToken ct = default)
    {
        var existing = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Address {id} not found");

        if (existing.UserId != userId)
            throw new UnauthorizedAccessException("Address does not belong to this user");

        await repo.DeleteAsync(id, ct);
    }

    private static AddressDto ToDto(Address a) => new(
        a.Id, a.Label, a.Street, a.Apartment,
        a.Entrance, a.Floor, a.Intercom, a.Comment,
        a.Latitude, a.Longitude
    );

    private static Address Map(UpsertAddressRequest r) => new()
    {
        Label = r.Label,
        Street = r.Street,
        Apartment = r.Apartment,
        Entrance = r.Entrance,
        Floor = r.Floor,
        Intercom = r.Intercom,
        Comment = r.Comment,
        Latitude = r.Latitude,
        Longitude = r.Longitude,
    };
}
