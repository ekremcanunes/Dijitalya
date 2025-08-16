// ===== CartPage.jsx =====
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../api/ApiService';

const CartPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ApiService.getCart();
            console.log('Cart data:', data);
            setCart(data);
        } catch (error) {
            console.error('Cart loading error:', error);
            alert('Sepet yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleRemove = async (productId) => {
        setActionLoading(true);
        try {
            await ApiService.removeFromCart(productId);
            await loadCart(); // Sepeti yeniden yükle
        } catch (error) {
            console.error('Remove error:', error);
            alert('Ürün kaldırılırken hata oluştu: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuantityChange = async (productId, quantity) => {
        if (quantity < 1) return;

        setActionLoading(true);
        try {
            await ApiService.updateCartItem(productId, quantity);
            await loadCart(); // Sepeti yeniden yükle
        } catch (error) {
            console.error('Quantity update error:', error);
            alert('Miktar güncellenirken hata oluştu: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };
    // CartPage.jsx'de handleRemove ve handleQuantityChange fonksiyonlarının sonuna:
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    const handleCheckout = () => {
        if (cart.items.length === 0) {
            alert('Sepetiniz boş!');
            return;
        }
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/products');
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Sepetim</h1>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Sepetim</h1>

            {cart.items.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Sepetiniz boş
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Alışverişe başlamak için ürünler sayfasını ziyaret edin.
                    </p>
                    <button
                        onClick={handleContinueShopping}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Alışverişe Başla
                    </button>
                </div>
            ) : (
                <>
                    {/* Loading indicator */}
                    {actionLoading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-blue-800">İşlem yapılıyor...</span>
                            </div>
                        </div>
                    )}

                    {/* Sepet tablosu */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ürün
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Adet
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Birim Fiyat
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Toplam
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        İşlem
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cart.items.map(item => (
                                    <tr key={`${item.productId}-${item.id}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.productImageUrl || '/placeholder-image.jpg'}
                                                    alt={item.productName}
                                                    className="h-12 w-12 object-cover rounded mr-4"
                                                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.productName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e =>
                                                    handleQuantityChange(item.productId, Number(e.target.value))
                                                }
                                                disabled={actionLoading}
                                                className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                                            ₺{(item.productPrice || item.price)?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                            ₺{((item.productPrice || item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemove(item.productId)}
                                                disabled={actionLoading}
                                                className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                Kaldır
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Toplam ve işlemler */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <div>
                                <button
                                    onClick={handleContinueShopping}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    ← Alışverişe Devam Et
                                </button>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 mb-4">
                                    Toplam: ₺{cart.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={actionLoading}
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'İşlem yapılıyor...' : 'Sipariş Ver'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600 text-center">
                            <p>• Kargo ücretsiz • Güvenli ödeme • 14 gün iade garantisi</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;