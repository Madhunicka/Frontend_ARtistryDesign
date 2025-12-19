import React from 'react';
import Link from 'next/link';
import { STATIC_FILE_URL } from '../utils/config';

interface Product {
    _id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    modelUrl: string;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link href={`/product/${product._id}`} className="group block h-full">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-gray-100">
                <div className="relative aspect-square bg-[#F8F8FB] overflow-hidden">
                    <img
                        src={`${STATIC_FILE_URL}${product.thumbnailUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#4A47A3] shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                        View 3D
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-[#FFB26B] uppercase tracking-wider mb-1">
                            {product.category}
                        </p>
                        <h3 className="text-lg font-bold text-[#1E1E1E] group-hover:text-[#4A47A3] transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-sm text-[#6F6F6F]">Ready to view</span>
                        <div className="w-8 h-8 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#4A47A3] group-hover:bg-[#4A47A3] group-hover:text-white transition-colors duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
