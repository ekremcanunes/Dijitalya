using EkoPazar.Services;
using EkoPazar.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceAPI.Controllers
{
    /// <summary>
    /// Ürün yönetimi işlemleri
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Ürünleri listeler (arama ve kategori filtreleme ile)
        /// </summary>
        /// <param name="search">Arama terimi (opsiyonel)</param>
        /// <param name="categoryId">Kategori ID (opsiyonel)</param>
        /// <returns>Ürün listesi</returns>
        /// <response code="200">Ürün listesi döndürüldü</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Product>), 200)]
        public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] int? categoryId)
        {
            IEnumerable<Product> products;

            if (!string.IsNullOrEmpty(search))
            {
                products = await _productService.SearchProductsAsync(search);
            }
            else if (categoryId.HasValue)
            {
                products = await _productService.GetProductsByCategoryAsync(categoryId.Value);
            }
            else
            {
                products = await _productService.GetAllProductsAsync();
            }

            return Ok(products);
        }

        /// <summary>
        /// Belirli bir ürünü ID ile getirir
        /// </summary>
        /// <param name="id">Ürün ID</param>
        /// <returns>Ürün detayları</returns>
        /// <response code="200">Ürün bulundu</response>
        /// <response code="404">Ürün bulunamadı</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Product), 200)]
        [ProducesResponseType(typeof(object), 404)]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Ürün bulunamadı." });
            }

            return Ok(product);
        }

        /// <summary>
        /// Tüm kategorileri listeler
        /// </summary>
        /// <returns>Kategori listesi</returns>
        /// <response code="200">Kategori listesi</response>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(IEnumerable<Category>), 200)]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost]
        [Authorize] // Admin rolü eklenebilir
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var product = await _productService.CreateProductAsync(productDto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize] // Admin rolü eklenebilir
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _productService.UpdateProductAsync(id, productDto);
            if (product == null)
            {
                return NotFound(new { message = "Ürün bulunamadı." });
            }

            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize] // Admin rolü eklenebilir
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Ürün bulunamadı." });
            }

            return Ok(new { message = "Ürün başarıyla silindi." });
        }
    }
}