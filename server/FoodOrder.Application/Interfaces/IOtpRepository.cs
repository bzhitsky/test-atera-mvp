using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Interfaces;

public interface IOtpRepository
{
    Task<OtpCode?> GetLatestValidAsync(string phone, CancellationToken ct = default);
    Task CreateAsync(OtpCode otp, CancellationToken ct = default);
    Task MarkUsedAsync(OtpCode otp, CancellationToken ct = default);
    Task InvalidatePreviousAsync(string phone, CancellationToken ct = default);
}
