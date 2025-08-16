// ===== NotificationContext.jsx =====
import React, { createContext, useContext, useState } from 'react';
import NotificationModal from '../components/NotificationModal';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        autoClose: false,
        autoCloseDelay: 3000,
        confirmText: 'Tamam',
        showCancel: false,
        cancelText: 'Ýptal',
        onConfirm: null,
        onCancel: null
    });

    // Notification gösterme fonksiyonu
    const showNotification = (options) => {
        setNotification({
            isOpen: true,
            title: options.title || 'Bilgilendirme',
            message: options.message || '',
            type: options.type || 'info',
            autoClose: options.autoClose || false,
            autoCloseDelay: options.autoCloseDelay || 3000,
            confirmText: options.confirmText || 'Tamam',
            showCancel: options.showCancel || false,
            cancelText: options.cancelText || 'Ýptal',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        });
    };

    // Notification kapatma fonksiyonu
    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    // Kýsa yollar - farklý türler için
    const showSuccess = (message, title = 'Baþarýlý!', options = {}) => {
        showNotification({
            type: 'success',
            title,
            message,
            autoClose: true,
            autoCloseDelay: 3000,
            ...options
        });
    };

    const showError = (message, title = 'Hata!', options = {}) => {
        showNotification({
            type: 'error',
            title,
            message,
            ...options
        });
    };

    const showWarning = (message, title = 'Uyarý!', options = {}) => {
        showNotification({
            type: 'warning',
            title,
            message,
            ...options
        });
    };

    const showInfo = (message, title = 'Bilgi', options = {}) => {
        showNotification({
            type: 'info',
            title,
            message,
            autoClose: true,
            autoCloseDelay: 4000,
            ...options
        });
    };

    // Onay diyalogu
    const showConfirm = (message, title = 'Onay', onConfirm, options = {}) => {
        showNotification({
            type: 'warning',
            title,
            message,
            showCancel: true,
            confirmText: 'Evet',
            cancelText: 'Hayýr',
            onConfirm,
            ...options
        });
    };

    const value = {
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={hideNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                autoClose={notification.autoClose}
                autoCloseDelay={notification.autoCloseDelay}
                confirmText={notification.confirmText}
                showCancel={notification.showCancel}
                cancelText={notification.cancelText}
                onConfirm={notification.onConfirm}
                onCancel={notification.onCancel}
            />
        </NotificationContext.Provider>
    );
};

// Hook
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};