// ===== AuthContext.jsx =====
import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../api/ApiService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiðinde token kontrolü
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Invalid user data in localStorage:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await ApiService.login(email, password);

            if (response.success && response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);

                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Giriþ baþarýsýz' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Giriþ yapýlýrken hata oluþtu'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await ApiService.register(userData);

            if (response.success && response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);

                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Kayýt baþarýsýz' };
            }
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: error.message || 'Kayýt olurken hata oluþtu'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};