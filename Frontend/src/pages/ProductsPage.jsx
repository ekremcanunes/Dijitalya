/* eslint-disable no-unused-vars */
// ===== ProductsPage.jsx =====
import React, { useEffect, useState } from 'react';
import ApiService from '../api/ApiService';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // YENİ İMPORT

const ProductsPage = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const { showSuccess, showError } = useNotification(); // YENİ HOOK

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setInitialLoading(true);
        try {
            const [cats, prods] = await Promise.all([
                ApiService.getCategories(),
                ApiService.getProducts(),
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error('Products loading error:', error);
            // ❌ Eski: alert('Ürünler yüklenirken hata oluştu: ' + error.message);
            showError('Ürünler yüklenirken hata oluştu: ' + error.message, 'Yükleme Hatası'); // ✅ Yeni
        } finally {
            setInitialLoading(false);
        }
    };

    const handleAddToCart = async (productId, quantity = 1) => {
        try {
            await ApiService.addToCart(productId, quantity);
            // ❌ Eski: alert('Ürün sepete eklendi!');
            showSuccess('Ürün sepete eklendi!', 'Sepete Eklendi'); // ✅ Yeni - otomatik kapanır
        } catch (error) {
            console.error('Add to cart error:', error);
            // ❌ Eski: alert('Sepete eklerken bir hata oluştu: ' + error.message);
            showError('Sepete eklerken bir hata oluştu: ' + error.message, 'Sepet Hatası'); // ✅ Yeni
        }
    };

    const filterProducts = () => {
        return products.filter(p => {
            const matchesCategory =
                !selectedCategoryId || p.categoryId === selectedCategoryId;
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    };

    if (initialLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Ürünler</h1>

            {/* Filtreler */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <select
                    value={selectedCategoryId || ''}
                    onChange={e =>
                        setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border rounded flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Ürün listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterProducts().map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>

            {/* Ürün bulunamadı mesajı */}
            {filterProducts().length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {searchTerm || selectedCategoryId
                            ? 'Aradığınız kriterlere uygun ürün bulunamadı.'
                            : 'Henüz ürün bulunmamaktadır.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;