using EkoPazar.Models;
using Microsoft.AspNetCore.Http;

namespace EkoPazar.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<Product>> GetAllProductsAdminAsync();
        Task<Product?> GetProductForEditAsync(int id);
        Task<Product> CreateProductAsync(CreateProductDto productDto);
        Task<Product?> UpdateProductAsync(int id, UpdateProductDto productDto);
        Task<bool> DeleteProductAsync(int id);
        Task<string> SaveImageAsync(IFormFile imageFile);

        // Kategori işlemleri
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<Category> CreateCategoryAsync(CreateCategoryDto categoryDto);
        Task<Category?> UpdateCategoryAsync(int id, UpdateCategoryDto categoryDto);
        Task<bool> DeleteCategoryAsync(int id);
    }

    // DTOs
    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}