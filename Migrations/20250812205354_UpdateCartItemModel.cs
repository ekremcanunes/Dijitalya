using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EkoPazar.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCartItemModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4031));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4035));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4036));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4038));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4039));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4235));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4249));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4251));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4253));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 53, 53, 560, DateTimeKind.Utc).AddTicks(4255));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(7891));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(7895));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(7896));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(7897));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(7898));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(8085));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(8093));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(8095));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(8097));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 12, 20, 51, 37, 122, DateTimeKind.Utc).AddTicks(8099));
        }
    }
}
