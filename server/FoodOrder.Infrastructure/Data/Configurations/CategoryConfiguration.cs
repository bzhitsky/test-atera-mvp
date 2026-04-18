using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).UseIdentityAlwaysColumn();

        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.ImageUrl).HasMaxLength(500);

        builder.HasIndex(c => c.SortOrder);

        // Seed data
        builder.HasData(
            new Category { Id = 1, Name = "Популярное", SortOrder = 0 },
            new Category { Id = 2, Name = "Пицца", SortOrder = 1 },
            new Category { Id = 3, Name = "Бургеры", SortOrder = 2 },
            new Category { Id = 4, Name = "Паста", SortOrder = 3 },
            new Category { Id = 5, Name = "Салаты", SortOrder = 4 },
            new Category { Id = 6, Name = "Напитки", SortOrder = 5 },
            new Category { Id = 7, Name = "Десерты", SortOrder = 6 }
        );
    }
}
