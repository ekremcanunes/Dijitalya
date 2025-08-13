import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminApiService from "../../api/AdminApiService"; 
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import { useAuth } from '../../context/AuthContext';  

const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        activeProducts: 0,
        inactiveProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [products, categories] = await Promise.all([
                AdminApiService.getAllProducts(),
                AdminApiService.getAllCategories()
            ]);

            setStats({
                totalProducts: products.length,
                totalCategories: categories.length,
                activeProducts: products.filter(p => p.isActive).length,
                inactiveProducts: products.filter(p => !p.isActive).length
            });
        } catch (error) {
            console.error('Stats loading error:', error);
        } finally {
            setLoading(false);
        }
    };

    const isActiveRoute = (path) => {
        return location.pathname.includes(path);
    };

    const StatCard = ({ title, value, icon, color = "blue" }) => (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-full bg-${color}-100`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>
                        {loading ? '...' : value}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-gray-600">Hoş geldiniz, {user?.firstName}</p>
                        </div>
                        <Link
                            to="/"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ana Siteye Dön
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64">
                        <nav className="bg-white rounded-lg shadow p-4">
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/admin"
                                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/admin'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        📊 Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/products"
                                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveRoute('/admin/products')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        📦 Ürün Yönetimi
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/categories"
                                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveRoute('/admin/categories')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        📂 Kategori Yönetimi
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <Routes>
                            <Route path="/" element={
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <StatCard
                                            title="Toplam Ürün"
                                            value={stats.totalProducts}
                                            icon="📦"
                                            color="blue"
                                        />
                                        <StatCard
                                            title="Aktif Ürün"
                                            value={stats.activeProducts}
                                            icon="✅"
                                            color="green"
                                        />
                                        <StatCard
                                            title="Pasif Ürün"
                                            value={stats.inactiveProducts}
                                            icon="❌"
                                            color="red"
                                        />
                                        <StatCard
                                            title="Toplam Kategori"
                                            value={stats.totalCategories}
                                            icon="📂"
                                            color="purple"
                                        />
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Link
                                                to="/admin/products/new"
                                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-2xl mr-3">➕</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">Yeni Ürün Ekle</p>
                                                    <p className="text-sm text-gray-600">Yeni ürün oluştur</p>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/admin/categories/new"
                                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-2xl mr-3">📁</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">Yeni Kategori Ekle</p>
                                                    <p className="text-sm text-gray-600">Yeni kategori oluştur</p>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/admin/products"
                                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-2xl mr-3">📋</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">Ürünleri Yönet</p>
                                                    <p className="text-sm text-gray-600">Mevcut ürünleri düzenle</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            } />
                            <Route path="/products/*" element={<ProductManagement />} />
                            <Route path="/categories/*" element={<CategoryManagement />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;