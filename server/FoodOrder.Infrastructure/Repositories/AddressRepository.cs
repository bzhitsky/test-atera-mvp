using FoodOrder.Application.Interfaces;
using FoodOrder.Domain.Entities;
using FoodOrder.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrder.Infrastructure.Repositories;

public class AddressRepository(AppDbContext db) : IAddressRepository
{
    public async Task<IReadOnlyList<Address>> GetByUserIdAsync(int userId, CancellationToken ct = default) =>
        await db.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

    public async Task<Address?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Addresses.FindAsync([id], ct);

    public async Task<Address> CreateAsync(Address address, CancellationToken ct = default)
    {
        db.Addresses.Add(address);
        await db.SaveChangesAsync(ct);
        return address;
    }

    public async Task UpdateAsync(Address address, CancellationToken ct = default)
    {
        db.Addresses.Update(address);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        await db.Addresses.Where(a => a.Id == id).ExecuteDeleteAsync(ct);
    }
}
