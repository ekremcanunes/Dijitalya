import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import AdminApiService from '../../api/AdminApiService';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await AdminApiService.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error('Products loading error:', error);
            alert('Ürünler yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`"${name}" ürününü silmek istediğinizden emin misiniz?`)) {
            try {
                await AdminApiService.deleteProduct(id);
                alert('Ürün başarıyla silindi!');
                loadProducts();
            } catch (error) {
                alert('Ürün silinirken hata oluştu: ' + error.message);
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && product.isActive) ||
            (statusFilter === 'inactive' && !product.isActive);
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h2>
                <Link
                    to="/admin/products/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    ➕ Yeni Ürün Ekle
                </Link>
            </div>

            {/* Filtreler */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tüm Ürünler</option>
                        <option value="active">Aktif Ürünler</option>
                        <option value="inactive">Pasif Ürünler</option>
                    </select>
                </div>
            </div>

            {/* Ürün listesi */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ürün
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategori
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fiyat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stok
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={product.imageUrl ? `https://localhost:7203${product.imageUrl}` : 'https://localhost:7203/placeholder-image.jpg'}
                                                alt={product.name}
                                                className="h-12 w-12 object-cover rounded-lg mr-4"
                                                onError={(e) => {
                                                    if (e.target.src !== 'https://localhost:7203/placeholder-image.jpg') {
                                                        e.target.src = 'https://localhost:7203/placeholder-image.jpg';
                                                    }
                                                }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {product.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.category?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₺{product.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                ✏️ Düzenle
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                                : 'Henüz ürün bulunmamaktadır.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductForm = ({ isEdit = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        imageUrl: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadCategories();
        if (isEdit && id) {
            loadProduct();
        }
    }, [isEdit, id]);

    const loadCategories = async () => {
        try {
            const data = await AdminApiService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Categories loading error:', error);
        }
    };

    const loadProduct = async () => {
        setLoading(true);
        try {
            const product = await AdminApiService.getProduct(id);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                stock: product.stock.toString(),
                categoryId: product.categoryId.toString(),
                imageUrl: product.imageUrl
            });
        } catch (error) {
            console.error('Product loading error:', error);
            alert('Ürün yüklenirken hata oluştu: ' + error.message);
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ürün adı gereklidir';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Açıklama gereklidir';
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Geçerli bir fiyat girin';
        }
        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = 'Geçerli bir stok miktarı girin';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Kategori seçin';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        setImageUploading(true);
        try {
            const result = await AdminApiService.uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
            alert('Resim başarıyla yüklendi!');
        } catch (error) {
            alert('Resim yüklenirken hata oluştu: ' + error.message);
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                imageUrl: formData.imageUrl
            };

            if (isEdit) {
                await AdminApiService.updateProduct(id, productData);
                alert('Ürün başarıyla güncellendi!');
            } else {
                await AdminApiService.createProduct(productData);
                alert('Ürün başarıyla oluşturuldu!');
            }

            navigate('/admin/products');
        } catch (error) {
            alert(`Ürün ${isEdit ? 'güncellenirken' : 'oluşturulurken'} hata oluştu: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <Link
                    to="/admin/products"
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Geri Dön
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün Adı *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            >
                                <option value="">Kategori seçin</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fiyat (₺) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stok Miktarı *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => handleInputChange('stock', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama *
                        </label>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Resim yükleme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ürün Resmi
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleImageUpload(file);
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={loading || imageUploading}
                            />
                            {imageUploading && (
                                <div className="flex items-center text-blue-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    Yükleniyor...
                                </div>
                            )}
                        </div>

                        {formData.imageUrl && (
                            <div className="mt-4">
                                <img
                                    src={formData.imageUrl}
                                    alt="Ürün önizleme"
                                    className="h-32 w-32 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            to="/admin/products"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || imageUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductManagement = () => {
    return (
        <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/new" element={<ProductForm />} />
            <Route path="/edit/:id" element={<ProductForm isEdit={true} />} />
        </Routes>
    );
};

export default ProductManagement;