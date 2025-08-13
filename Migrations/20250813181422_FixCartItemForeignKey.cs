using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EkoPazar.Migrations
{
    /// <inheritdoc />
    public partial class FixCartItemForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_AspNetUsers_UserId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_UserId_ProductId",
                table: "CartItems");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_UserId",
                table: "CartItems",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_AspNetUsers_UserId",
                table: "CartItems",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_AspNetUsers_UserId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_UserId",
                table: "CartItems");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Description", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(802), "Elektronik ürünler", "Elektronik" },
                    { 2, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(813), "Giyim ürünleri", "Giyim" },
                    { 3, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(814), "Ev ve yaşam ürünleri", "Ev & Yaşam" },
                    { 4, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(815), "Kitaplar", "Kitap" },
                    { 5, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(817), "Spor ürünleri", "Spor" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsActive", "Name", "Price", "Stock" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(1128), "Apple iPhone 14 128GB", "https://via.placeholder.com/300x300?text=iPhone+14", true, "iPhone 14", 25000m, 50 },
                    { 2, 1, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(1149), "Samsung Galaxy S23 256GB", "https://via.placeholder.com/300x300?text=Galaxy+S23", true, "Samsung Galaxy S23", 22000m, 30 },
                    { 3, 5, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(1152), "Nike Air Max Ayakkabı", "https://via.placeholder.com/300x300?text=Nike+Air+Max", true, "Nike Air Max", 1200m, 100 },
                    { 4, 2, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(1154), "Levi's 501 Original Jean", "https://via.placeholder.com/300x300?text=Levi%27s+Jean", true, "Levi's Jean", 450m, 75 },
                    { 5, 1, new DateTime(2025, 8, 13, 16, 11, 28, 513, DateTimeKind.Utc).AddTicks(1156), "Apple MacBook Pro M2 13 inch", "https://via.placeholder.com/300x300?text=MacBook+Pro", true, "MacBook Pro", 35000m, 25 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_UserId_ProductId",
                table: "CartItems",
                columns: new[] { "UserId", "ProductId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_AspNetUsers_UserId",
                table: "CartItems",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
