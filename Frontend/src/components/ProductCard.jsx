// ===== ProductCard.jsx =====
import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, disabled = false }) => {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!onAddToCart || adding || disabled) return;

        setAdding(true);
        try {
            await onAddToCart(product.id, quantity);
            setQuantity(1);
        } catch (error) {
            console.error('Add to cart failed:', error);
        } finally {
            setAdding(false);
        }
    };

    const isOutOfStock = product.stock === 0;
    const isDisabled = adding || disabled || isOutOfStock || !onAddToCart;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Ürün resmi */}
            <div className="relative mb-4">
                <img
                    src={product.imageUrl || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                        <span className="text-white font-bold text-lg">Stokta Yok</span>
                    </div>
                )}
            </div>

            {/* Ürün bilgileri */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">
                        ₺{product.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-sm text-gray-500">
                        Stok: {product.stock}
                    </span>
                </div>
            </div>

            {/* Sepete ekleme bölümü */}
            {onAddToCart ? (
                <div className="mt-4 space-y-3">
                    {!isOutOfStock && (
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Adet:</label>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isDisabled}
                            >
                                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1)
                                    .map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={isDisabled}
                        className={`w-full py-2 px-4 rounded font-medium transition-colors ${isDisabled
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {adding ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Ekleniyor...
                            </div>
                        ) : isOutOfStock ? (
                            'Stokta Yok'
                        ) : (
                            'Sepete Ekle'
                        )}
                    </button>
                </div>
            ) : (
                <div className="mt-4">
                    <div className="bg-gray-100 text-gray-600 text-center py-2 px-4 rounded font-medium">
                        Sepete eklemek için giriş yapın
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;