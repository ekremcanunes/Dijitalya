using EkoPazar.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace EkoPazar.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.HasOne(d => d.Category)
                    .WithMany(p => p.Products)
                    .HasForeignKey(d => d.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // CartItem configuration - GÜNCELLENMIŞ
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);

                // UserId string olarak tutulacak
                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasMaxLength(450);

                // User ilişkisi tamamen opsiyonel - misafir kullanıcılar için foreign key yok
                // Navigation property var ama foreign key constraint yok
                entity.Navigation(e => e.User).IsRequired(false);

                // Product ilişkisi - bu foreign key olacak
                entity.HasOne(d => d.Product)
                    .WithMany(p => p.CartItems)
                    .HasForeignKey(d => d.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Unique index sadece UserId ve ProductId üzerinde
                entity.HasIndex(e => new { e.UserId, e.ProductId })
                    .IsUnique();
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Orders)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.HasOne(d => d.Order)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(d => d.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Elektronik", Description = "Elektronik ürünler" },
                new Category { Id = 2, Name = "Giyim", Description = "Giyim ürünleri" },
                new Category { Id = 3, Name = "Ev & Yaşam", Description = "Ev ve yaşam ürünleri" },
                new Category { Id = 4, Name = "Kitap", Description = "Kitaplar" },
                new Category { Id = 5, Name = "Spor", Description = "Spor ürünleri" }
            );

            modelBuilder.Entity<Product>().HasData(
                 new Product { Id = 1, Name = "iPhone 14", Description = "Apple iPhone 14 128GB", Price = 25000, Stock = 50, CategoryId = 1, ImageUrl = "https://via.placeholder.com/300x300?text=iPhone+14" },
                 new Product { Id = 2, Name = "Samsung Galaxy S23", Description = "Samsung Galaxy S23 256GB", Price = 22000, Stock = 30, CategoryId = 1, ImageUrl = "https://via.placeholder.com/300x300?text=Galaxy+S23" },
                 new Product { Id = 3, Name = "Nike Air Max", Description = "Nike Air Max Ayakkabı", Price = 1200, Stock = 100, CategoryId = 5, ImageUrl = "https://via.placeholder.com/300x300?text=Nike+Air+Max" },
                 new Product { Id = 4, Name = "Levi's Jean", Description = "Levi's 501 Original Jean", Price = 450, Stock = 75, CategoryId = 2, ImageUrl = "https://via.placeholder.com/300x300?text=Levi%27s+Jean" },
                 new Product { Id = 5, Name = "MacBook Pro", Description = "Apple MacBook Pro M2 13 inch", Price = 35000, Stock = 25, CategoryId = 1, ImageUrl = "https://via.placeholder.com/300x300?text=MacBook+Pro" }
            );
        }
    }
}