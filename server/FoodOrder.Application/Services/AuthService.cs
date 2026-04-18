using FoodOrder.Application.Interfaces;

namespace FoodOrder.Application.Services;

/// <summary>Placeholder — реализация будет добавлена в задаче auth-back</summary>
public class AuthService : IAuthService
{
    public Task SendOtpAsync(string phone, CancellationToken ct = default) =>
        throw new NotImplementedException("AuthService will be implemented in auth step");

    public Task<(string Token, int UserId)> VerifyOtpAsync(string phone, string code, CancellationToken ct = default) =>
        throw new NotImplementedException("AuthService will be implemented in auth step");
}
