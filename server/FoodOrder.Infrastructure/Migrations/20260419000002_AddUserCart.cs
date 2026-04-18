using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodOrder.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_carts",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ItemsJson = table.Column<string>(type: "text", nullable: false, defaultValue: "[]"),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_carts", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_user_carts_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "user_carts");
        }
    }
}
