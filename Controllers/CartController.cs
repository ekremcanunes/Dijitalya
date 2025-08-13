using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EkoPazar.Services;
using System.Security.Claims;

namespace EkoPazar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        private string GetUserIdentifier()
        {
            try
            {
                // Kullanıcı giriş yapmışsa UserId kullan
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    _logger.LogInformation($"Authenticated user: {userId}");
                    return userId;
                }

                // Giriş yapmamışsa session ID kullan
                var sessionId = HttpContext.Session.GetString("GuestSessionId");
                if (string.IsNullOrEmpty(sessionId))
                {
                    sessionId = Guid.NewGuid().ToString();
                    HttpContext.Session.SetString("GuestSessionId", sessionId);
                    _logger.LogInformation($"Created new guest session: {sessionId}");
                }
                else
                {
                    _logger.LogInformation($"Existing guest session: {sessionId}");
                }

                return $"guest_{sessionId}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserIdentifier");
                // Fallback: Session çalışmıyorsa basit bir ID oluştur
                return $"fallback_{Guid.NewGuid().ToString()[..8]}";
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var userIdentifier = GetUserIdentifier();
                _logger.LogInformation($"Getting cart for: {userIdentifier}");

                var cartItems = await _cartService.GetCartItemsAsync(userIdentifier);
                var total = await _cartService.GetCartTotalAsync(userIdentifier);

                var response = new
                {
                    items = cartItems,
                    total = total,
                    itemCount = cartItems.Sum(item => item.Quantity)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userIdentifier = GetUserIdentifier();
                _logger.LogInformation($"Adding to cart for user: {userIdentifier}, Product: {addToCartDto.ProductId}, Quantity: {addToCartDto.Quantity}");

                var cartItem = await _cartService.AddToCartAsync(userIdentifier, addToCartDto);

                if (cartItem == null)
                {
                    return BadRequest(new { message = "Ürün bulunamadı veya aktif değil" });
                }

                return Ok(new { message = "Ürün sepete eklendi", cartItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding to cart. User: {GetUserIdentifier()}, ProductId: {addToCartDto.ProductId}");
                return BadRequest(new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateCartItem(int productId, [FromBody] UpdateCartItemDto updateDto)
        {
            try
            {
                var userIdentifier = GetUserIdentifier();
                var cartItem = await _cartService.UpdateCartItemAsync(userIdentifier, productId, updateDto.Quantity);

                if (cartItem == null)
                {
                    return Ok(new { message = "Ürün sepetten kaldırıldı" });
                }

                return Ok(new { message = "Sepet güncellendi", cartItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating cart item. User: {GetUserIdentifier()}, ProductId: {productId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            try
            {
                var userIdentifier = GetUserIdentifier();
                var success = await _cartService.RemoveFromCartAsync(userIdentifier, productId);

                if (!success)
                {
                    return NotFound(new { message = "Ürün sepette bulunamadı" });
                }

                return Ok(new { message = "Ürün sepetten kaldırıldı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing from cart. User: {GetUserIdentifier()}, ProductId: {productId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("merge")]
        [Authorize]
        public async Task<IActionResult> MergeGuestCart()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var guestSessionId = HttpContext.Session.GetString("GuestSessionId");

                if (!string.IsNullOrEmpty(guestSessionId))
                {
                    await _cartService.MergeGuestCartToUserAsync($"guest_{guestSessionId}", userId);
                    HttpContext.Session.Remove("GuestSessionId");
                }

                return Ok(new { message = "Sepet birleştirildi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error merging guest cart");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}