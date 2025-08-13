// ===== Navbar.jsx =====
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo ve ana menü */}
                    <div className="flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-xl font-bold hover:text-blue-200 transition-colors"
                            onClick={closeMobileMenu}
                        >
                            🛒 EkoPazar
                        </Link>

                        {/* Desktop menü */}
                        <div className="hidden md:flex space-x-4">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded transition-colors ${isActiveRoute('/')
                                        ? 'bg-blue-700 text-white'
                                        : 'hover:bg-blue-700'
                                    }`}
                            >
                                Ana Sayfa
                            </Link>
                            <Link
                                to="/products"
                                className={`px-3 py-2 rounded transition-colors ${isActiveRoute('/products')
                                        ? 'bg-blue-700 text-white'
                                        : 'hover:bg-blue-700'
                                    }`}
                            >
                                Ürünler
                            </Link>
                        </div>
                    </div>

                    {/* Sağ taraf menü */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    to="/cart"
                                    className={`flex items-center px-3 py-2 rounded transition-colors ${isActiveRoute('/cart')
                                            ? 'bg-blue-700 text-white'
                                            : 'hover:bg-blue-700'
                                        }`}
                                >
                                    🛒 Sepet
                                </Link>
                                <Link
                                    to="/orders"
                                    className={`flex items-center px-3 py-2 rounded transition-colors ${isActiveRoute('/orders')
                                            ? 'bg-blue-700 text-white'
                                            : 'hover:bg-blue-700'
                                        }`}
                                >
                                    📦 Siparişler
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium">
                                        Hoş geldin, {user.firstName}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition-colors text-sm font-medium"
                                    >
                                        Çıkış
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-2">
                                <Link
                                    to="/login"
                                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors font-medium"
                                >
                                    Giriş
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors font-medium"
                                >
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-blue-500">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className={`block px-3 py-2 rounded transition-colors ${isActiveRoute('/')
                                        ? 'bg-blue-700 text-white'
                                        : 'hover:bg-blue-700'
                                    }`}
                            >
                                Ana Sayfa
                            </Link>
                            <Link
                                to="/products"
                                onClick={closeMobileMenu}
                                className={`block px-3 py-2 rounded transition-colors ${isActiveRoute('/products')
                                        ? 'bg-blue-700 text-white'
                                        : 'hover:bg-blue-700'
                                    }`}
                            >
                                Ürünler
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        to="/cart"
                                        onClick={closeMobileMenu}
                                        className={`block px-3 py-2 rounded transition-colors ${isActiveRoute('/cart')
                                                ? 'bg-blue-700 text-white'
                                                : 'hover:bg-blue-700'
                                            }`}
                                    >
                                        🛒 Sepet
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={closeMobileMenu}
                                        className={`block px-3 py-2 rounded transition-colors ${isActiveRoute('/orders')
                                                ? 'bg-blue-700 text-white'
                                                : 'hover:bg-blue-700'
                                            }`}
                                    >
                                        📦 Siparişler
                                    </Link>
                                    <div className="px-3 py-2 text-sm">
                                        Hoş geldin, {user.firstName}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors"
                                    >
                                        Çıkış
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block px-3 py-2 rounded bg-blue-700 hover:bg-blue-800 transition-colors"
                                    >
                                        Giriş
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="block px-3 py-2 rounded bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                        Kayıt Ol
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;