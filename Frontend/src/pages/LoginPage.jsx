/* eslint-disable no-undef */
// ===== LoginPage.jsx =====
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location.state]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta alanı gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre alanı gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                alert(result.message || 'Giriş başarısız');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Giriş yapılırken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Giriş Yap</h2>
                    <p className="text-gray-600">Hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-posta *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                            placeholder="ornek@email.com"
                            disabled={loading}
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Şifre *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.password
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                            placeholder="Şifrenizi girin"
                            disabled={loading}
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Giriş yapılıyor...
                            </>
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Hesabınız yok mu?{' '}
                        <Link
                            to="/register"
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                        >
                            Kayıt Ol
                        </Link>
                    </p>
                </div>

                {/* Demo bilgileri - geliştirme aşamasında */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                            <strong>Demo için:</strong><br />
                            E-posta: demo@example.com<br />
                            Şifre: Demo123!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;