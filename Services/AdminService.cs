using EkoPazar.Data;
using EkoPazar.Models;
using Microsoft.EntityFrameworkCore;

namespace EkoPazar.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext context, IWebHostEnvironment environment, ILogger<AdminService> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // Product işlemleri
        public async Task<IEnumerable<Product>> GetAllProductsAdminAsync()
        {
            return await _context.Products
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Product?> GetProductForEditAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateProductAsync(CreateProductDto productDto)
        {
            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                Stock = productDto.Stock,
                CategoryId = productDto.CategoryId,
                ImageUrl = productDto.ImageUrl,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetProductForEditAsync(product.Id) ?? product;
        }

        public async Task<Product?> UpdateProductAsync(int id, UpdateProductDto productDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return null;
            }

            product.Name = productDto.Name ?? product.Name;
            product.Description = productDto.Description ?? product.Description;
            product.Price = productDto.Price ?? product.Price;
            product.Stock = productDto.Stock ?? product.Stock;
            product.CategoryId = productDto.CategoryId ?? product.CategoryId;
            product.ImageUrl = productDto.ImageUrl ?? product.ImageUrl;

            await _context.SaveChangesAsync();
            return await GetProductForEditAsync(id);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return false;
            }

            product.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                throw new ArgumentException("Geçerli bir resim dosyası seçin.");
            }

            // Dosya uzantısını kontrol et
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException("Sadece resim dosyaları (jpg, png, gif, webp) yükleyebilirsiniz.");
            }

            // Dosya boyutunu kontrol et (5MB limit)
            if (imageFile.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("Resim dosyası 5MB'dan küçük olmalıdır.");
            }

            try
            {
                // Uploads klasörünü oluştur
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "products");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation("Created uploads directory: {Path}", uploadsFolder);
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                _logger.LogInformation("Saving image to: {FilePath}", filePath);

                // Dosyayı kaydet
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                // Web'de erişilebilir URL döndür
                var webUrl = $"/uploads/products/{fileName}";
                _logger.LogInformation("Image saved successfully: {WebUrl}", webUrl);

                return webUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving image file");
                throw new InvalidOperationException("Resim kaydedilirken hata oluştu: " + ex.Message);
            }
        }

        // Kategori işlemleri
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<Category> CreateCategoryAsync(CreateCategoryDto categoryDto)
        {
            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<Category?> UpdateCategoryAsync(int id, UpdateCategoryDto categoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return null;
            }

            category.Name = categoryDto.Name ?? category.Name;
            category.Description = categoryDto.Description ?? category.Description;

            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return false;
            }

            // Bu kategoriye ait ürün var mı kontrol et
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id && p.IsActive);
            if (hasProducts)
            {
                throw new InvalidOperationException("Bu kategoriye ait aktif ürünler bulunmaktadır. Önce ürünleri silin veya başka kategoriye taşıyın.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}