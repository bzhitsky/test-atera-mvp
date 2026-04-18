using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class OtpRepository(AppDbContext db) : IOtpRepository
{
    public async Task<OtpCode?> GetLatestValidAsync(string phone, CancellationToken ct = default) =>
        await db.OtpCodes
            .Where(o => o.Phone == phone && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(ct);

    public async Task CreateAsync(OtpCode otp, CancellationToken ct = default)
    {
        db.OtpCodes.Add(otp);
        await db.SaveChangesAsync(ct);
    }

    public async Task MarkUsedAsync(OtpCode otp, CancellationToken ct = default)
    {
        otp.IsUsed = true;
        db.OtpCodes.Update(otp);
        await db.SaveChangesAsync(ct);
    }

    public async Task InvalidatePreviousAsync(string phone, CancellationToken ct = default)
    {
        var active = await db.OtpCodes
            .Where(o => o.Phone == phone && !o.IsUsed)
            .ToListAsync(ct);

        foreach (var code in active)
            code.IsUsed = true;

        if (active.Count > 0)
            await db.SaveChangesAsync(ct);
    }
}
