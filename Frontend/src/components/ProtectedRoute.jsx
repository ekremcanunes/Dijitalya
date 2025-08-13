// ===== ProtectedRoute.jsx =====
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoadingSpinner } from '../components/Common/LoadingSpinner';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoadingSpinner text="Kimlik doðrulanýyor..." />;
    }

    if (!user) {
        // Kullanýcýyý login'den sonra geldiði sayfaya yönlendirmek için state ile location bilgisini gönder
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

// Admin route'larý için özel bileþen (gelecekte kullaným için)
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

    // TODO: Admin kontrolü eklenebilir
    // if (!user.isAdmin) {
    //     return <Navigate to="/unauthorized" replace />;
    // }

    return children;
};

export default ProtectedRoute;