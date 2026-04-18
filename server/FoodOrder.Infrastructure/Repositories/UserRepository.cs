using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public async Task<User?> GetByPhoneAsync(string phone, CancellationToken ct = default) =>
        await db.Users.FirstOrDefaultAsync(u => u.Phone == phone, ct);

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Users.FindAsync([id], ct);

    public async Task<User> CreateAsync(User user, CancellationToken ct = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return user;
    }

    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync(ct);
    }
}
