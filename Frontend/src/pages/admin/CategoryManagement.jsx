import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import AdminApiService from "../../api/AdminApiService"; 

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await AdminApiService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Categories loading error:', error);
            alert('Kategoriler yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`"${name}" kategorisini silmek istediğinizden emin misiniz? Bu kategoriye ait ürünler varsa kategori silinemez.`)) {
            try {
                await AdminApiService.deleteCategory(id);
                alert('Kategori başarıyla silindi!');
                loadCategories();
            } catch (error) {
                alert('Kategori silinirken hata oluştu: ' + error.message);
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Kategoriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h2>
                <Link
                    to="/admin/categories/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    ➕ Yeni Kategori Ekle
                </Link>
            </div>

            {/* Arama */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <input
                    type="text"
                    placeholder="Kategori ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Kategori listesi */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategori Adı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Açıklama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Oluşturma Tarihi
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map(category => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {category.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {category.description || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/admin/categories/edit/${category.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                ✏️ Düzenle
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
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

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Arama kriterlerinize uygun kategori bulunamadı.'
                                : 'Henüz kategori bulunmamaktadır.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryForm = ({ isEdit = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit && id) {
            loadCategory();
        }
    }, [isEdit, id]);

    const loadCategory = async () => {
        setLoading(true);
        try {
            const category = await AdminApiService.getCategory(id);
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } catch (error) {
            console.error('Category loading error:', error);
            alert('Kategori yüklenirken hata oluştu: ' + error.message);
            navigate('/admin/categories');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Kategori adı gereklidir';
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const categoryData = {
                name: formData.name.trim(),
                description: formData.description.trim()
            };

            if (isEdit) {
                await AdminApiService.updateCategory(id, categoryData);
                alert('Kategori başarıyla güncellendi!');
            } else {
                await AdminApiService.createCategory(categoryData);
                alert('Kategori başarıyla oluşturuldu!');
            }

            navigate('/admin/categories');
        } catch (error) {
            alert(`Kategori ${isEdit ? 'güncellenirken' : 'oluşturulurken'} hata oluştu: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Kategori yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </h2>
                <Link
                    to="/admin/categories"
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Geri Dön
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori Adı *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Kategori adını girin"
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama
                        </label>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Kategori açıklamasını girin (opsiyonel)"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            to="/admin/categories"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
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

const CategoryManagement = () => {
    return (
        <Routes>
            <Route path="/" element={<CategoryList />} />
            <Route path="/new" element={<CategoryForm />} />
            <Route path="/edit/:id" element={<CategoryForm isEdit={true} />} />
        </Routes>
    );
};

export default CategoryManagement;