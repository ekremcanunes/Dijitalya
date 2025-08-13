import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../api/ApiService';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [guestInfo, setGuestInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [shippingAddress, setShippingAddress] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getCart();
            setCart(data);
            if (data.items.length === 0) {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Cart loading error:', error);
            alert('Sepet yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Giriş yapmamış kullanıcılar için bilgi kontrolü
        if (!user) {
            if (!guestInfo.firstName.trim()) {
                newErrors.firstName = 'Ad alanı gereklidir';
            }
            if (!guestInfo.lastName.trim()) {
                newErrors.lastName = 'Soyad alanı gereklidir';
            }
            if (!guestInfo.email.trim()) {
                newErrors.email = 'E-posta alanı gereklidir';
            } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
                newErrors.email = 'Geçerli bir e-posta adresi girin';
            }
            if (!guestInfo.phone.trim()) {
                newErrors.phone = 'Telefon alanı gereklidir';
            }
        }

        if (!shippingAddress.trim()) {
            newErrors.shippingAddress = 'Teslimat adresi gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            // Giriş yapmış kullanıcı için normal sipariş
            if (user) {
                await ApiService.createOrder({
                    shippingAddress: shippingAddress.trim()
                });
                alert('Sipariş başarıyla oluşturuldu!');
                navigate('/orders');
            } else {
                // Giriş yapmamış kullanıcı için - önce kayıt ol
                const shouldRegister = window.confirm(
                    'Siparişinizi tamamlamak için hesap oluşturmanız gerekiyor. Şimdi kayıt olmak istiyor musunuz?'
                );

                if (shouldRegister) {
                    // Bilgileri localStorage'a kaydet (geçici)
                    localStorage.setItem('pendingOrder', JSON.stringify({
                        guestInfo,
                        shippingAddress,
                        cart
                    }));
                    navigate('/register', {
                        state: {
                            from: '/checkout',
                            guestInfo
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Sipariş oluşturulurken hata oluştu: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field === 'shippingAddress') {
            setShippingAddress(value);
        } else {
            setGuestInfo(prev => ({ ...prev, [field]: value }));
        }

        // Error temizle
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Sipariş Özeti</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol taraf - Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-6">
                        {user ? 'Teslimat Bilgileri' : 'Kişisel ve Teslimat Bilgileri'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Giriş yapmamış kullanıcılar için kişisel bilgiler */}
                        {!user && (
                            <div className="border-b pb-6 mb-6">
                                <h3 className="text-lg font-medium mb-4">Kişisel Bilgiler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ad *
                                        </label>
                                        <input
                                            type="text"
                                            value={guestInfo.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Soyad *
                                        </label>
                                        <input
                                            type="text"
                                            value={guestInfo.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            E-posta *
                                        </label>
                                        <input
                                            type="email"
                                            value={guestInfo.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            value={guestInfo.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Teslimat adresi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teslimat Adresi *
                            </label>
                            <textarea
                                rows="4"
                                value={shippingAddress}
                                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                                placeholder="Tam adresinizi yazın..."
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.shippingAddress ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={submitting}
                            />
                            {errors.shippingAddress && (
                                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || cart.items.length === 0}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    İşleniyor...
                                </div>
                            ) : user ? (
                                'Siparişi Tamamla'
                            ) : (
                                'Kayıt Ol ve Siparişi Tamamla'
                            )}
                        </button>
                    </form>
                </div>

                {/* Sağ taraf - Sepet özeti */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-6">Sepet Özeti</h2>

                    <div className="space-y-4 mb-6">
                        {cart.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div className="flex items-center">
                                    <img
                                        src={item.productImageUrl ? `https://localhost:7203${item.productImageUrl}` : 'https://localhost:7203/placeholder-image.jpg'}
                                        alt={item.productName}
                                        className="h-12 w-12 object-cover rounded"
                                        onError={(e) => {
                                            if (e.target.src !== 'https://localhost:7203/placeholder-image.jpg') {
                                                e.target.src = 'https://localhost:7203/placeholder-image.jpg';
                                            }
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-sm text-gray-600">{item.quantity} adet</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900">
                                    ₺{(item.totalPrice || (item.productPrice * item.quantity))?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Toplam:</span>
                            <span className="text-2xl font-bold text-green-600">
                                ₺{cart.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p>• Kargo ücretsiz</p>
                            <p>• Kapıda ödeme imkanı</p>
                            <p>• 14 gün iade garantisi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;