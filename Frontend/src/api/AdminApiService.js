import axios from 'axios';

const API_BASE_URL = 'https://localhost:7203/api';

const adminApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - token ekleme
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - hata yönetimi
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Admin API Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

const AdminApiService = {
    // Product işlemleri
    getAllProducts: async () => {
        try {
            const response = await adminApi.get('/admin/products');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ürünler yüklenemedi');
        }
    },

    getProduct: async (id) => {
        try {
            const response = await adminApi.get(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ürün bulunamadı');
        }
    },

    createProduct: async (productData) => {
        try {
            const response = await adminApi.post('/admin/products', productData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ürün oluşturulamadı');
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await adminApi.put(`/admin/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ürün güncellenemedi');
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await adminApi.delete(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ürün silinemedi');
        }
    },

    uploadImage: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await adminApi.post('/admin/products/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Resim yüklenemedi');
        }
    },

    // Category işlemleri
    getAllCategories: async () => {
        try {
            const response = await adminApi.get('/admin/categories');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Kategoriler yüklenemedi');
        }
    },

    getCategory: async (id) => {
        try {
            const response = await adminApi.get(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Kategori bulunamadı');
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await adminApi.post('/admin/categories', categoryData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Kategori oluşturulamadı');
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await adminApi.put(`/admin/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Kategori güncellenemedi');
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await adminApi.delete(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Kategori silinemedi');
        }
    }
};

export default AdminApiService;