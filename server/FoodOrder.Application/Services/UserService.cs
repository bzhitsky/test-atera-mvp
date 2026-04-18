using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;

namespace FoodOrder.Application.Services;

public class UserService(IUserRepository repo) : IUserService
{
    public async Task<UserDto?> GetProfileAsync(int userId, CancellationToken ct = default)
    {
        var user = await repo.GetByIdAsync(userId, ct);
        return user is null ? null : new UserDto(user.Id, user.Phone, user.Name, user.Email);
    }

    public async Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await repo.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        user.Name = request.Name ?? user.Name;
        user.Email = request.Email ?? user.Email;

        await repo.UpdateAsync(user, ct);
        return new UserDto(user.Id, user.Phone, user.Name, user.Email);
    }
}
