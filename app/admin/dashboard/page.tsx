'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, STATIC_FILE_URL, FRONTEND_URL } from '../../../utils/config';

interface Product {
    _id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    modelUrl: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('floor');
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin');
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modelFile || !thumbnailFile) {
            alert('Please select both model and thumbnail files');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('model', modelFile);
        formData.append('thumbnail', thumbnailFile);

        try {
            await axios.post(`${API_BASE_URL}/products`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Product uploaded successfully!');
            setName('');
            setCategory('floor');
            setModelFile(null);
            setThumbnailFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Error uploading product:', error);
            alert('Failed to upload product');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F8F8FB]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1C1B29] text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Admin<span className="text-[#6EC6FF]">Portal</span></h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center px-4 py-3 bg-[#4A47A3] rounded-lg text-white shadow-lg">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                    </a>
                    <a href="/" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Store
                    </a>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => {
                            localStorage.removeItem('isAdmin');
                            router.push('/admin');
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8 md:hidden flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-[#1E1E1E]">Dashboard</h1>
                        <button onClick={() => router.push('/')} className="text-[#4A47A3]">Store</button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Form */}
                        <div className="card p-6 h-fit">
                            <h2 className="text-xl font-bold mb-6 text-[#1E1E1E] flex items-center">
                                <span className="w-8 h-8 rounded-full bg-[#4A47A3]/10 text-[#4A47A3] flex items-center justify-center mr-3 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </span>
                                Add Product
                            </h2>
                            <form onSubmit={handleUpload} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#6F6F6F] mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4A47A3] focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Modern Vase"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#6F6F6F] mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4A47A3] focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="floor">Floor Decoration</option>
                                        <option value="wall">Wall Hanging</option>
                                        <option value="other">Other Decor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#6F6F6F] mb-1">3D Model (.glb)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".glb,.gltf"
                                            onChange={(e) => setModelFile(e.target.files ? e.target.files[0] : null)}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4A47A3]/10 file:text-[#4A47A3] hover:file:bg-[#4A47A3]/20 cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#6F6F6F] mb-1">Thumbnail</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4A47A3]/10 file:text-[#4A47A3] hover:file:bg-[#4A47A3]/20 cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Product'}
                                </button>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="lg:col-span-2 card p-6">
                            <h2 className="text-xl font-bold mb-6 text-[#1E1E1E]">Inventory</h2>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A47A3] mx-auto"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6F6F] uppercase tracking-wider">Item</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6F6F] uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6F6F] uppercase tracking-wider">QR Access</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#6F6F6F] uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {products.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={`${STATIC_FILE_URL}${product.thumbnailUrl}`}
                                                                alt={product.name}
                                                                className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                                            />
                                                            <span className="ml-4 font-medium text-[#1E1E1E]">{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#4A47A3]/10 text-[#4A47A3] capitalize">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="group relative">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${FRONTEND_URL}/product/${product._id}`)}`}
                                                                alt="QR Code"
                                                                className="h-10 w-10 cursor-pointer hover:scale-150 transition-transform origin-left bg-white p-1 rounded shadow-sm border border-gray-100"
                                                            />
                                                            <div className="hidden group-hover:block absolute top-full left-0 mt-2 bg-black text-white text-xs p-2 rounded z-10 whitespace-nowrap">
                                                                Scan to view on mobile
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {products.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-[#6F6F6F]">
                                                        <div className="flex flex-col items-center">
                                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                                            <p>No products in inventory yet.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
