using EkoPazar.Data;
using EkoPazar.Models;
using Microsoft.EntityFrameworkCore;

namespace EkoPazar.Services
{
    public interface IOrderService
    {
        Task<OrderDto?> CreateOrderAsync(string userId, CreateOrderDto createOrderDto);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(string userId);
        Task<OrderDto?> GetOrderByIdAsync(string userId, int orderId);
        Task<bool> CancelOrderAsync(string userId, int orderId);
    }

    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICartService _cartService;

        public OrderService(ApplicationDbContext context, ICartService cartService)
        {
            _context = context;
            _cartService = cartService;
        }

        public async Task<OrderDto?> CreateOrderAsync(string userId, CreateOrderDto createOrderDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    throw new InvalidOperationException("Sepet boş.");
                }

                // Stok kontrolü
                foreach (var cartItem in cartItems)
                {
                    if (cartItem.Product.Stock < cartItem.Quantity)
                    {
                        throw new InvalidOperationException($"{cartItem.Product.Name} için yeterli stok yok.");
                    }
                }

                var totalAmount = cartItems.Sum(ci => ci.Product.Price * ci.Quantity);

                var order = new Order
                {
                    UserId = userId,
                    TotalAmount = totalAmount,
                    ShippingAddress = createOrderDto.ShippingAddress,
                    Status = OrderStatus.Pending
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var orderItems = cartItems.Select(ci => new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Product.Price
                }).ToList();

                _context.OrderItems.AddRange(orderItems);

                // Stokları güncelle
                foreach (var cartItem in cartItems)
                {
                    cartItem.Product.Stock -= cartItem.Quantity;
                }

                // Sepeti temizle
                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetOrderByIdAsync(userId, order.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                ShippingAddress = o.ShippingAddress,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    ProductImageUrl = oi.Product.ImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            });
        }

        public async Task<OrderDto?> GetOrderByIdAsync(string userId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
            {
                return null;
            }

            return new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                ShippingAddress = order.ShippingAddress,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    ProductImageUrl = oi.Product.ImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            };
        }

        public async Task<bool> CancelOrderAsync(string userId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null || order.Status != OrderStatus.Pending)
            {
                return false;
            }

            // Stokları geri yükle
            foreach (var orderItem in order.OrderItems)
            {
                orderItem.Product.Stock += orderItem.Quantity;
            }

            order.Status = OrderStatus.Cancelled;
            await _context.SaveChangesAsync();
            return true;
        }
    }

    // DTOs
    public class CreateOrderDto
    {
        public string ShippingAddress { get; set; } = string.Empty;
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}