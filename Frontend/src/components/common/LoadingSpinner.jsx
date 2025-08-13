import React from 'react';

const LoadingSpinner = ({
    size = 'default',
    color = 'blue',
    text = null,
    className = ''
}) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        default: 'h-8 w-8',
        large: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        green: 'text-green-600',
        red: 'text-red-600',
        gray: 'text-gray-600',
        white: 'text-white'
    };

    return (
        <div className={`flex flex-col justify-center items-center ${className}`}>
            <svg
                className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
            </svg>
            {text && (
                <p className={`mt-2 text-sm ${colorClasses[color]} font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );
};

// Farklý kullaným senaryolarý için özel bileþenler
export const PageLoadingSpinner = ({ text = "Yükleniyor..." }) => (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text={text} />
    </div>
);

export const SectionLoadingSpinner = ({ text = "Yükleniyor..." }) => (
    <div className="py-12">
        <LoadingSpinner size="default" text={text} />
    </div>
);

export const ButtonLoadingSpinner = ({ text = "Ýþlem yapýlýyor..." }) => (
    <div className="flex items-center">
        <LoadingSpinner size="small" color="white" className="mr-2" />
        <span>{text}</span>
    </div>
);

export const CardLoadingSpinner = () => (
    <div className="flex justify-center py-8">
        <LoadingSpinner size="default" color="gray" />
    </div>
);

export default LoadingSpinner;