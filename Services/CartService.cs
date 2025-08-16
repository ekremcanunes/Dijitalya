using EkoPazar.Data;
using EkoPazar.Models;
using Microsoft.EntityFrameworkCore;

namespace EkoPazar.Services
{
    public interface ICartService
    {
        Task<IEnumerable<CartItemDto>> GetCartItemsAsync(string userId);
        Task<CartItemDto?> AddToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<CartItemDto?> UpdateCartItemAsync(string userId, int productId, int quantity);
        Task<bool> RemoveFromCartAsync(string userId, int productId);
        Task<bool> ClearCartAsync(string userId);
        Task<decimal> GetCartTotalAsync(string userId);

        // Misafir kullanıcılar için yeni metodlar
        Task<bool> MergeGuestCartToUserAsync(string guestSessionId, string userId);
    }

    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartService> _logger;

        public CartService(ApplicationDbContext context, ILogger<CartService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CartItemDto>> GetCartItemsAsync(string userId)
        {
            _logger.LogInformation($"=== GetCartItemsAsync for userId: {userId} ===");

            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .ThenInclude(p => p.Category)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                _logger.LogInformation($"Found {cartItems.Count} cart items in database");

                foreach (var item in cartItems)
                {
                    _logger.LogInformation($"Cart item: ID={item.Id}, ProductId={item.ProductId}, ProductName={item.Product?.Name}, Quantity={item.Quantity}, UserId={item.UserId}");
                }

                var result = cartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    ProductId = ci.ProductId,
                    ProductName = ci.Product.Name,
                    ProductPrice = ci.Product.Price,
                    ProductImageUrl = ci.Product.ImageUrl,
                    Quantity = ci.Quantity,
                    TotalPrice = ci.Product.Price * ci.Quantity
                }).ToList();

                _logger.LogInformation($"Returning {result.Count} cart items as DTOs");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetCartItemsAsync for userId: {userId}");
                throw;
            }
        }

        public async Task<CartItemDto?> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            _logger.LogInformation($"=== AddToCartAsync ===");
            _logger.LogInformation($"UserId: {userId}");
            _logger.LogInformation($"ProductId: {addToCartDto.ProductId}");
            _logger.LogInformation($"Quantity: {addToCartDto.Quantity}");

            try
            {
                var product = await _context.Products.FindAsync(addToCartDto.ProductId);
                if (product == null || !product.IsActive)
                {
                    _logger.LogWarning($"Product not found or inactive: ProductId={addToCartDto.ProductId}");
                    return null;
                }

                _logger.LogInformation($"Product found: {product.Name}, Stock: {product.Stock}");

                if (product.Stock < addToCartDto.Quantity)
                {
                    _logger.LogWarning($"Insufficient stock. Required: {addToCartDto.Quantity}, Available: {product.Stock}");
                    throw new InvalidOperationException("Yeterli stok yok.");
                }

                var existingCartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

                if (existingCartItem != null)
                {
                    _logger.LogInformation($"Existing cart item found: ID={existingCartItem.Id}, CurrentQuantity={existingCartItem.Quantity}");

                    if (product.Stock < existingCartItem.Quantity + addToCartDto.Quantity)
                    {
                        _logger.LogWarning($"Insufficient stock for update. Current: {existingCartItem.Quantity}, Adding: {addToCartDto.Quantity}, Stock: {product.Stock}");
                        throw new InvalidOperationException("Yeterli stok yok.");
                    }

                    existingCartItem.Quantity += addToCartDto.Quantity;
                    _logger.LogInformation($"Updated quantity to: {existingCartItem.Quantity}");

                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Changes saved successfully");

                    return new CartItemDto
                    {
                        Id = existingCartItem.Id,
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductPrice = product.Price,
                        ProductImageUrl = product.ImageUrl,
                        Quantity = existingCartItem.Quantity,
                        TotalPrice = product.Price * existingCartItem.Quantity
                    };
                }

                _logger.LogInformation("Creating new cart item");
                var cartItem = new CartItem
                {
                    UserId = userId,
                    ProductId = addToCartDto.ProductId,
                    Quantity = addToCartDto.Quantity
                };

                _context.CartItems.Add(cartItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"New cart item created: ID={cartItem.Id}");

                // Veritabanında gerçekten kaydedildi mi kontrol et
                var savedItem = await _context.CartItems
                    .Include(ci => ci.Product)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItem.Id);

                if (savedItem != null)
                {
                    _logger.LogInformation($"Verification: Item saved successfully with ID={savedItem.Id}");
                }
                else
                {
                    _logger.LogError("ERROR: Item was not saved to database!");
                }

                return new CartItemDto
                {
                    Id = cartItem.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductPrice = product.Price,
                    ProductImageUrl = product.ImageUrl,
                    Quantity = cartItem.Quantity,
                    TotalPrice = product.Price * cartItem.Quantity
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in AddToCartAsync for userId: {userId}, productId: {addToCartDto.ProductId}");
                throw;
            }
        }

        // Misafir sepetini kullanıcı hesabına birleştir
        public async Task<bool> MergeGuestCartToUserAsync(string guestSessionId, string userId)
        {
            _logger.LogInformation($"=== MergeGuestCartToUserAsync ===");
            _logger.LogInformation($"GuestSessionId: {guestSessionId}");
            _logger.LogInformation($"UserId: {userId}");

            var guestCartItems = await _context.CartItems
                .Where(ci => ci.UserId == guestSessionId)
                .ToListAsync();

            _logger.LogInformation($"Found {guestCartItems.Count} guest cart items");

            if (!guestCartItems.Any())
                return true;

            foreach (var guestItem in guestCartItems)
            {
                _logger.LogInformation($"Processing guest item: ProductId={guestItem.ProductId}, Quantity={guestItem.Quantity}");

                var existingUserItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == guestItem.ProductId);

                if (existingUserItem != null)
                {
                    // Mevcut kullanıcı sepetindeki ürün varsa, miktarları birleştir
                    _logger.LogInformation($"Merging with existing user item: OldQuantity={existingUserItem.Quantity}, Adding={guestItem.Quantity}");
                    existingUserItem.Quantity += guestItem.Quantity;
                }
                else
                {
                    // Yeni ürün olarak kullanıcı sepetine ekle
                    _logger.LogInformation($"Moving guest item to user cart");
                    guestItem.UserId = userId;
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Guest cart merged successfully");
            return true;
        }

        public async Task<CartItemDto?> UpdateCartItemAsync(string userId, int productId, int quantity)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

            if (cartItem == null)
            {
                return null;
            }

            if (quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
                return null;
            }

            if (cartItem.Product.Stock < quantity)
            {
                throw new InvalidOperationException("Yeterli stok yok.");
            }

            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();

            return new CartItemDto
            {
                Id = cartItem.Id,
                ProductId = cartItem.Product.Id,
                ProductName = cartItem.Product.Name,
                ProductPrice = cartItem.Product.Price,
                ProductImageUrl = cartItem.Product.ImageUrl,
                Quantity = cartItem.Quantity,
                TotalPrice = cartItem.Product.Price * cartItem.Quantity
            };
        }

        public async Task<bool> RemoveFromCartAsync(string userId, int productId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

            if (cartItem == null)
            {
                return false;
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> GetCartTotalAsync(string userId)
        {
            _logger.LogInformation($"=== GetCartTotalAsync for userId: {userId} ===");

            var total = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .SumAsync(ci => ci.Product.Price * ci.Quantity);

            _logger.LogInformation($"Cart total calculated: {total}");
            return total;
        }
    }

    // DTOs
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; }
        public string ProductImageUrl { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }
}