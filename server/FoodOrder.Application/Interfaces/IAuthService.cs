namespace FoodOrder.Application.Interfaces;

public interface IAuthService
{
    Task SendOtpAsync(string phone, CancellationToken ct = default);
    Task<(string Token, int UserId)> VerifyOtpAsync(string phone, string code, CancellationToken ct = default);
}
