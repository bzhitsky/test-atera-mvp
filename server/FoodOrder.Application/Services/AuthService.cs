using FoodOrder.Application.Interfaces;
using FoodOrder.Application.Options;
using FoodOrder.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FoodOrder.Application.Services;

public class AuthService(
    IOtpRepository otpRepo,
    IUserRepository userRepo,
    IJwtTokenGenerator jwtGenerator,
    IOptions<OtpOptions> otpOptions,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly OtpOptions _otp = otpOptions.Value;

    public async Task SendOtpAsync(string phone, CancellationToken ct = default)
    {
        await otpRepo.InvalidatePreviousAsync(phone, ct);

        var code = _otp.MockEnabled
            ? _otp.MockCode
            : Random.Shared.Next(100_000, 999_999).ToString();

        var otp = new OtpCode
        {
            Phone = phone,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_otp.ExpiryMinutes)
        };

        await otpRepo.CreateAsync(otp, ct);

        // In production replace with actual SMS gateway call.
        logger.LogInformation("OTP for {Phone}: {Code} (expires in {Minutes} min)", phone, code, _otp.ExpiryMinutes);
    }

    public async Task<(string Token, int UserId, bool IsNewUser)> VerifyOtpAsync(
        string phone, string code, CancellationToken ct = default)
    {
        var otp = await otpRepo.GetLatestValidAsync(phone, ct)
            ?? throw new InvalidOperationException("OTP not found or has expired");

        if (otp.Code != code)
            throw new UnauthorizedAccessException("Invalid OTP code");

        await otpRepo.MarkUsedAsync(otp, ct);

        var isNewUser = false;
        var user = await userRepo.GetByPhoneAsync(phone, ct);
        if (user is null)
        {
            user = await userRepo.CreateAsync(new User { Phone = phone }, ct);
            isNewUser = true;
        }

        var token = jwtGenerator.GenerateToken(user.Id, user.Phone);
        return (token, user.Id, isNewUser);
    }
}
