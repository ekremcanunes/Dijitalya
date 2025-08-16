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

                // Giriş yapmamışsa header'dan guest ID al
                var guestId = Request.Headers["X-Guest-Id"].FirstOrDefault();

                if (!string.IsNullOrEmpty(guestId))
                {
                    _logger.LogInformation($"Using guest ID from header: {guestId}");
                    return $"guest_{guestId}";
                }

                // Fallback: Session dene
                var sessionId = HttpContext.Session.GetString("GuestSessionId");
                if (!string.IsNullOrEmpty(sessionId))
                {
                    _logger.LogInformation($"Using session ID: {sessionId}");
                    return $"guest_{sessionId}";
                }

                // Son çare: Yeni ID oluştur ama bu durumda sepet kaybedilir
                var newId = Guid.NewGuid().ToString();
                _logger.LogWarning($"No guest ID found, creating fallback: {newId}");
                return $"guest_{newId}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserIdentifier");
                var fallbackId = $"fallback_{Guid.NewGuid().ToString()[..8]}";
                _logger.LogWarning($"Using fallback identifier: {fallbackId}");
                return fallbackId;
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
                    itemCount = cartItems.Sum(item => item.Quantity),
                    userIdentifier = userIdentifier // Debug için
                };

                _logger.LogInformation($"Cart response: {cartItems.Count()} items, total: {total}");
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

                _logger.LogInformation($"Successfully added item to cart: {cartItem.ProductName}");
                return Ok(new { message = "Ürün sepete eklendi", cartItem, userIdentifier });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding to cart. ProductId: {addToCartDto.ProductId}");
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
                _logger.LogError(ex, $"Error updating cart item. ProductId: {productId}");
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
                _logger.LogError(ex, $"Error removing from cart. ProductId: {productId}");
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
                var guestId = Request.Headers["X-Guest-Id"].FirstOrDefault();

                _logger.LogInformation($"Merging cart: UserId={userId}, GuestId={guestId}");

                if (!string.IsNullOrEmpty(guestId))
                {
                    await _cartService.MergeGuestCartToUserAsync($"guest_{guestId}", userId);
                }

                return Ok(new { message = "Sepet birleştirildi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error merging guest cart");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Debug endpoint
        [HttpGet("debug")]
        public IActionResult Debug()
        {
            var userIdentifier = GetUserIdentifier();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var guestId = Request.Headers["X-Guest-Id"].FirstOrDefault();

            return Ok(new
            {
                UserIdentifier = userIdentifier,
                AuthenticatedUserId = userId,
                GuestIdFromHeader = guestId,
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false
            });
        }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}