import axios from 'axios';

const API_BASE_URL = 'https://localhost:7203/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Session için gerekli
});

// Request interceptor - token ekleme
api.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            // 401 hatası sadece korumalı endpoint'lerde logout yapsın
            const isProtectedEndpoint = error.config?.url?.includes('/orders') ||
                error.config?.url?.includes('/merge');

            if (isProtectedEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

const ApiService = {
    // Auth işlemleri
    login: async (email, password) => {
        try {
            console.log('🔐 Login attempt for:', email);
            const response = await api.post('/auth/login', { email, password });

            // Giriş yaptıktan sonra misafir sepetini birleştir
            if (response.data.accessToken) {
                try {
                    await api.post('/cart/merge');
                } catch (mergeError) {
                    console.warn('⚠️ Sepet birleştirme hatası:', mergeError);
                    // Birleştirme hatası login'i engellemez
                }
            }

            return {
                success: response.data.accessToken ? true : false,
                message: response.data.message,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                user: response.data.user
            };
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw new Error(error.response?.data?.message || 'Giriş başarısız');
        }
    },

    register: async (userData) => {
        try {
            console.log('📝 Register attempt for:', userData.email);
            const response = await api.post('/auth/register', userData);

            // Kayıt olduktan sonra da misafir sepetini birleştir
            if (response.data.accessToken) {
                try {
                    await api.post('/cart/merge');
                } catch (mergeError) {
                    console.warn('⚠️ Sepet birleştirme hatası:', mergeError);
                }
            }

            return {
                success: response.data.accessToken ? true : false,
                message: response.data.message,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                user: response.data.user
            };
        } catch (error) {
            console.error('❌ Register failed:', error);
            throw new Error(error.response?.data?.message || 'Kayıt başarısız');
        }
    },

    // Product işlemleri
    getProducts: async () => {
        try {
            console.log('📦 Fetching products...');
            const response = await api.get('/products');
            console.log('✅ Products loaded:', response.data?.length, 'items');
            return response.data;
        } catch (error) {
            console.error('❌ Get products error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw new Error(error.response?.data?.message || 'Ürünler yüklenemedi');
        }
    },

    getProduct: async (id) => {
        try {
            console.log('📦 Fetching product:', id);
            const response = await api.get(`/products/${id}`);
            console.log('✅ Product loaded:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Get product error:', error);
            throw new Error(error.response?.data?.message || 'Ürün bulunamadı');
        }
    },

    getCategories: async () => {
        try {
            console.log('📂 Fetching categories...');
            const response = await api.get('/products/categories');
            console.log('✅ Categories loaded:', response.data?.length, 'items');
            return response.data;
        } catch (error) {
            console.error('❌ Get categories error:', error);
            throw new Error(error.response?.data?.message || 'Kategoriler yüklenemedi');
        }
    },

    // Cart işlemleri - Artık herkes kullanabilir
    getCart: async () => {
        try {
            console.log('🛒 Fetching cart...');
            const response = await api.get('/cart');
            console.log('✅ Cart loaded:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Get cart error:', error);
            throw new Error(error.response?.data?.message || 'Sepet yüklenemedi');
        }
    },

    addToCart: async (productId, quantity = 1) => {
        try {
            console.log('🛒 Adding to cart:', { productId, quantity });
            const response = await api.post('/cart/add', {
                productId: productId,
                quantity: quantity
            });
            console.log('✅ Add to cart response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Add to cart API error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Sepete eklenirken hata oluştu');
        }
    },

    updateCartItem: async (productId, quantity) => {
        try {
            console.log('🛒 Updating cart item:', { productId, quantity });
            const response = await api.put(`/cart/${productId}`, { quantity });
            console.log('✅ Cart item updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update cart error:', error);
            throw new Error(error.response?.data?.message || 'Sepet güncellenemedi');
        }
    },

    removeFromCart: async (productId) => {
        try {
            console.log('🛒 Removing from cart:', productId);
            const response = await api.delete(`/cart/${productId}`);
            console.log('✅ Item removed from cart:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Remove from cart error:', error);
            throw new Error(error.response?.data?.message || 'Ürün sepetten kaldırılamadı');
        }
    },

    // Order işlemleri - Sadece giriş yapmış kullanıcılar
    getOrders: async () => {
        try {
            console.log('📋 Fetching orders...');
            const response = await api.get('/orders');
            console.log('✅ Orders loaded:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Get orders error:', error);
            throw new Error(error.response?.data?.message || 'Siparişler yüklenemedi');
        }
    },

    createOrder: async (orderData) => {
        try {
            console.log('📋 Creating order:', orderData);
            const response = await api.post('/orders', orderData);
            console.log('✅ Order created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Create order error:', error);
            throw new Error(error.response?.data?.message || 'Sipariş oluşturulamadı');
        }
    }
};

export default ApiService;