// ===== HomePage.jsx =====
import React from 'react';
import ProductsPage from './ProductsPage';

const HomePage = () => {
    return (
        <div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mb-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">EkoPazar'a Hoþ Geldiniz!</h1>
                    <p className="text-xl">En kaliteli ürünleri en uygun fiyatlarla keþfedin</p>
                </div>
            </div>
            <ProductsPage />
        </div>
    );
};

export default HomePage;