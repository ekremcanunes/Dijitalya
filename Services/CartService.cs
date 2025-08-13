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

        public CartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CartItemDto>> GetCartItemsAsync(string userId)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Category)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            return cartItems.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductPrice = ci.Product.Price,
                ProductImageUrl = ci.Product.ImageUrl,
                Quantity = ci.Quantity,
                TotalPrice = ci.Product.Price * ci.Quantity
            });
        }

        public async Task<CartItemDto?> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            var product = await _context.Products.FindAsync(addToCartDto.ProductId);
            if (product == null || !product.IsActive)
            {
                return null;
            }

            if (product.Stock < addToCartDto.Quantity)
            {
                throw new InvalidOperationException("Yeterli stok yok.");
            }

            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

            if (existingCartItem != null)
            {
                if (product.Stock < existingCartItem.Quantity + addToCartDto.Quantity)
                {
                    throw new InvalidOperationException("Yeterli stok yok.");
                }

                existingCartItem.Quantity += addToCartDto.Quantity;
                await _context.SaveChangesAsync();

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

            var cartItem = new CartItem
            {
                UserId = userId, // Misafir için sessionId kullanılacak
                ProductId = addToCartDto.ProductId,
                Quantity = addToCartDto.Quantity
            };

            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();

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

        // Misafir sepetini kullanıcı hesabına birleştir
        public async Task<bool> MergeGuestCartToUserAsync(string guestSessionId, string userId)
        {
            var guestCartItems = await _context.CartItems
                .Where(ci => ci.UserId == guestSessionId)
                .ToListAsync();

            if (!guestCartItems.Any())
                return true;

            foreach (var guestItem in guestCartItems)
            {
                var existingUserItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == guestItem.ProductId);

                if (existingUserItem != null)
                {
                    // Mevcut kullanıcı sepetindeki ürün varsa, miktarları birleştir
                    existingUserItem.Quantity += guestItem.Quantity;
                }
                else
                {
                    // Yeni ürün olarak kullanıcı sepetine ekle
                    guestItem.UserId = userId;
                }
            }

            // Misafir sepetindeki öğeleri misafir için silmek istemiyorsak, sadece userId'yi güncelleriz
            // Eğer silmek istiyorsak, aşağıdaki satırı açabiliriz:
            // _context.CartItems.RemoveRange(guestCartItems.Where(g => g.UserId != userId));

            await _context.SaveChangesAsync();
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
            return await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .SumAsync(ci => ci.Product.Price * ci.Quantity);
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