"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export function TrendingProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent any parent link clicks if any (though there aren't any in the current structure)
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div className="group relative bg-[#151b24] border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
            <Link href={`/product/${product.id}`} className="block aspect-square relative bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.images[0] || 'https://placehold.co/600x400/101822/FFF?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.tags?.includes("SALE") && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">SALE</span>}
                {product.tags?.includes("NEW") && <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded">NEW</span>}
            </Link>
            <div className="p-4">
                <h3 className="font-bold text-white text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(product.price)}
                    </span>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer hover:shadow-lg hover:shadow-primary/30"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
