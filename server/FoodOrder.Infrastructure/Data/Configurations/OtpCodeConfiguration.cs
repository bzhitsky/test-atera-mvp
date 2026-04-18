using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class OtpCodeConfiguration : IEntityTypeConfiguration<OtpCode>
{
    public void Configure(EntityTypeBuilder<OtpCode> builder)
    {
        builder.ToTable("otp_codes");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).UseIdentityAlwaysColumn();

        builder.Property(o => o.Phone).IsRequired().HasMaxLength(20);
        builder.Property(o => o.Code).IsRequired().HasMaxLength(10);
        builder.Property(o => o.CreatedAt).HasDefaultValueSql("now()");

        builder.HasIndex(o => new { o.Phone, o.IsUsed });
    }
}
