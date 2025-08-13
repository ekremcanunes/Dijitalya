using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EkoPazar.Services;
using EkoPazar.Models;

namespace EkoPazar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // TODO: Admin rolü eklenebilir [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        #region Product Operations

        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var products = await _adminService.GetAllProductsAdminAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all products for admin");
                return StatusCode(500, new { message = "Ürünler yüklenirken hata oluştu." });
            }
        }

        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductForEdit(int id)
        {
            try
            {
                var product = await _adminService.GetProductForEditAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Ürün bulunamadı." });
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product {ProductId} for edit", id);
                return StatusCode(500, new { message = "Ürün yüklenirken hata oluştu." });
            }
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var product = await _adminService.CreateProductAsync(productDto);
                return CreatedAtAction(nameof(GetProductForEdit), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { message = "Ürün oluşturulurken hata oluştu: " + ex.Message });
            }
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var product = await _adminService.UpdateProductAsync(id, productDto);
                if (product == null)
                {
                    return NotFound(new { message = "Ürün bulunamadı." });
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);
                return StatusCode(500, new { message = "Ürün güncellenirken hata oluştu: " + ex.Message });
            }
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _adminService.DeleteProductAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Ürün bulunamadı." });
                }
                return Ok(new { message = "Ürün başarıyla silindi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {ProductId}", id);
                return StatusCode(500, new { message = "Ürün silinirken hata oluştu: " + ex.Message });
            }
        }

        [HttpPost("products/upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "Resim dosyası seçilmedi." });
            }

            try
            {
                var imageUrl = await _adminService.SaveImageAsync(image);
                return Ok(new { imageUrl = imageUrl, message = "Resim başarıyla yüklendi." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { message = "Resim yüklenirken hata oluştu: " + ex.Message });
            }
        }

        #endregion

        #region Category Operations

        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _adminService.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all categories for admin");
                return StatusCode(500, new { message = "Kategoriler yüklenirken hata oluştu." });
            }
        }

        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            try
            {
                var category = await _adminService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı." });
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori yüklenirken hata oluştu." });
            }
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var category = await _adminService.CreateCategoryAsync(categoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { message = "Kategori oluşturulurken hata oluştu: " + ex.Message });
            }
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var category = await _adminService.UpdateCategoryAsync(id, categoryDto);
                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı." });
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori güncellenirken hata oluştu: " + ex.Message });
            }
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _adminService.DeleteCategoryAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Kategori bulunamadı." });
                }
                return Ok(new { message = "Kategori başarıyla silindi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori silinirken hata oluştu: " + ex.Message });
            }
        }

        #endregion
    }
}