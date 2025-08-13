import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../api/ApiService';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false
            };
        case 'INIT_AUTH':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: !!action.payload.user,
                loading: false
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        // Sayfa yüklendiðinde localStorage'dan bilgileri kontrol et
        const initializeAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    dispatch({
                        type: 'INIT_AUTH',
                        payload: { user, token }
                    });
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeAuth();

        // Pending order kontrolü - kayýt/giriþ sonrasý
        const checkPendingOrder = () => {
            const pendingOrder = localStorage.getItem('pendingOrder');
            if (pendingOrder && state.isAuthenticated) {
                try {
                    const orderData = JSON.parse(pendingOrder);
                    // Pending order'ý iþle
                    handlePendingOrder(orderData);
                    localStorage.removeItem('pendingOrder');
                } catch (error) {
                    console.error('Pending order processing error:', error);
                    localStorage.removeItem('pendingOrder');
                }
            }
        };

        if (!state.loading) {
            checkPendingOrder();
        }
    }, [state.loading, state.isAuthenticated]);

    const handlePendingOrder = async (orderData) => {
        try {
            // Sipariþ oluþtur
            await ApiService.createOrder({
                shippingAddress: orderData.shippingAddress
            });
            alert('Sipariþ baþarýyla oluþturuldu!');
            window.location.href = '/orders';
        } catch (error) {
            console.error('Pending order creation error:', error);
            alert('Sipariþ oluþturulurken hata oluþtu: ' + error.message);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await ApiService.login(email, password);

            if (result.success) {
                // Token ve user bilgilerini localStorage'a kaydet
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                if (result.refreshToken) {
                    localStorage.setItem('refreshToken', result.refreshToken);
                }

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: result.user,
                        token: result.accessToken
                    }
                });

                return result;
            }

            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const result = await ApiService.register(userData);

            if (result.success) {
                // Token ve user bilgilerini localStorage'a kaydet
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                if (result.refreshToken) {
                    localStorage.setItem('refreshToken', result.refreshToken);
                }

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: result.user,
                        token: result.accessToken
                    }
                });

                return result;
            }

            return result;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        // localStorage'ý temizle
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');

        // State'i sýfýrla
        dispatch({ type: 'LOGOUT' });
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        isAuthenticated: state.isAuthenticated,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};