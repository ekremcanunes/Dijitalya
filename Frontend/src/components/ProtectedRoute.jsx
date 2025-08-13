// ===== ProtectedRoute.jsx =====
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoadingSpinner } from '../components/Common/LoadingSpinner';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoadingSpinner text="Kimlik do�rulan�yor..." />;
    }

    if (!user) {
        // Kullan�c�y� login'den sonra geldi�i sayfaya y�nlendirmek i�in state ile location bilgisini g�nder
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
};

// Admin route'lar� i�in �zel bile�en (gelecekte kullan�m i�in)
export const AdminRoute = ({ children, redirectTo = '/login' }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoadingSpinner text="Yetki kontrol ediliyor..." />;
    }

    if (!user) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    // TODO: Admin kontrol� eklenebilir
    // if (!user.isAdmin) {
    //     return <Navigate to="/unauthorized" replace />;
    // }

    return children;
};

export default ProtectedRoute;