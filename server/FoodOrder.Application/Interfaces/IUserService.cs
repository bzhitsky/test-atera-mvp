using FoodOrder.Application.DTOs;

namespace FoodOrder.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetProfileAsync(int userId, CancellationToken ct = default);
    Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default);
}
