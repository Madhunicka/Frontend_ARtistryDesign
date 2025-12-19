'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/config';

interface Product {
    _id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    modelUrl: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === selectedCategory));
        }
    }, [selectedCategory, products]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            setProducts(response.data);
            setFilteredProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All Collection' },
        { id: 'floor', label: 'Floor Decor' },
        { id: 'wall', label: 'Wall Art' },
        { id: 'other', label: 'Accessories' },
    ];

    return (
        <main className="min-h-screen bg-[#F8F8FB]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1C1B29] to-[#2D2B42] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="text-[#FFB26B] font-bold tracking-widest uppercase text-sm mb-4 block">Augmented Reality Experience</span>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        Visualize Decor <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6EC6FF] to-[#4A47A3]">In Your Space</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-10 font-light">
                        Experience premium furniture and decor in your home instantly using our advanced AR technology.
                    </p>
                    <button onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary bg-white text-[#1C1B29] hover:bg-gray-100 hover:text-[#4A47A3]">
                        Explore Collection
                    </button>
                </div>
            </div>

            <div id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${selectedCategory === category.id
                                    ? 'bg-[#4A47A3] text-white shadow-lg transform scale-105'
                                    : 'bg-white text-[#6F6F6F] hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A47A3] mx-auto"></div>
                        <p className="mt-4 text-[#6F6F6F]">Curating collection...</p>
                    </div>
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                                <div className="w-20 h-20 bg-[#F8F8FB] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="h-10 w-10 text-[#4A47A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">Collection Empty</h3>
                                <p className="text-[#6F6F6F] max-w-md mx-auto mb-8">
                                    {products.length === 0
                                        ? "We are currently restocking our digital showroom."
                                        : "No items match this category."}
                                </p>
                                {products.length === 0 && (
                                    <Link href="/admin" className="btn-primary inline-flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Add First Product
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
