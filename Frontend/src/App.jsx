import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App min-h-screen bg-gray-50">
                    <Routes>
                        {/* Admin routes - farklý layout */}
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Normal site routes */}
                        <Route path="/*" element={
                            <>
                                <Navbar />
                                <main className="min-h-screen">
                                    <Routes>
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/products" element={<ProductsPage />} />
                                        <Route path="/cart" element={<CartPage />} />
                                        <Route path="/checkout" element={<CheckoutPage />} />
                                        <Route
                                            path="/orders"
                                            element={
                                                <ProtectedRoute>
                                                    <OrdersPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                    </Routes>
                                </main>
                            </>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;