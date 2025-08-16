// ===== NotificationModal.jsx =====
import React, { useEffect } from 'react';

const NotificationModal = ({
    isOpen,
    onClose,
    title = "Bilgilendirme",
    message,
    type = "info",
    autoClose = false,
    autoCloseDelay = 3000,
    confirmText = "Tamam",
    showCancel = false,
    cancelText = "Ýptal",
    onConfirm = null,
    onCancel = null
}) => {
    // Auto close özelliði
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    // ESC tuþu ile kapatma
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27 && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Body scroll'unu engelle
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Icon'larý type'a göre belirle
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    // Buton renklerini type'a göre belirle
    const getButtonColors = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'error':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
            case 'info':
            default:
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    {/* Icon */}
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <div className="mb-4">
                                {getIcon()}
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-semibold leading-6 text-gray-900 text-center mb-2">
                                {title}
                            </h3>

                            {/* Message */}
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 text-center">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${getButtonColors()}`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>

                        {showCancel && (
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                onClick={handleCancel}
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>

                    {/* Auto close indicator */}
                    {autoClose && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                    className={`h-1 rounded-full ${type === 'success' ? 'bg-green-600' :
                                        type === 'error' ? 'bg-red-600' :
                                            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'}`}
                                    style={{
                                        animation: `shrink ${autoCloseDelay}ms linear forwards`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationModal;