// ===== OrdersPage.jsx =====
import React, { useEffect, useState } from 'react';
import ApiService from '../api/ApiService';
import { SectionLoadingSpinner } from '../components/Common/LoadingSpinner';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Orders loading error:', error);
            alert('Siparişler yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Beklemede';
            case 'confirmed':
                return 'Onaylandı';
            case 'shipped':
                return 'Kargoya Verildi';
            case 'delivered':
                return 'Teslim Edildi';
            case 'cancelled':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Siparişlerim</h1>
                <SectionLoadingSpinner text="Siparişler yükleniyor..." />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Siparişlerim</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Henüz siparişiniz yok
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Alışverişe başlamak için ürünler sayfasını ziyaret edin.
                    </p>
                    <a
                        href="/products"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Ürünleri İncele
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Sipariş başlığı */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Sipariş #{order.id}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">
                                            ₺{order.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Teslimat adresi */}
                            <div className="px-6 py-4 bg-gray-50">
                                <div className="flex items-start">
                                    <span className="text-sm font-medium text-gray-700 mr-2">
                                        📍 Teslimat Adresi:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {order.shippingAddress}
                                    </span>
                                </div>
                            </div>

                            {/* Sipariş öğeleri */}
                            {order.items && order.items.length > 0 && (
                                <div className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                        Sipariş Detayları ({order.items.length} ürün)
                                    </h4>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={`${order.id}-${item.productId}-${index}`}
                                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={item.productImageUrl || '/placeholder-image.jpg'}
                                                        alt={item.productName}
                                                        className="h-12 w-12 object-cover rounded"
                                                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {item.quantity} adet × ₺{item.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        ₺{item.totalPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;