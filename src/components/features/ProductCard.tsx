"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { addToCart } = useCart();

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation
        addToCart(product);
    };

    return (
        <Link
            href={`/product/${product.id}`}
            className={cn(
                "group flex flex-col rounded-xl overflow-hidden border border-[#282f39] bg-[#1a1a1a]",
                "hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
                className
            )}
        >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#1a1f26] to-[#0f1216] p-4 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full rounded-md overflow-hidden">
                    <Image
                        src={product.images[0] || 'https://placehold.co/600x800/101822/FFF?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                        {product.tags.map(tag => (
                            <span
                                key={tag}
                                className={cn(
                                    "text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm",
                                    tag === 'SALE' ? 'bg-destructive' : 'bg-primary'
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="bg-[#1c222b] text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 gap-2">
                <div>
                    <h3 className="text-white font-bold text-lg truncate group-hover:text-primary transition-colors font-display">
                        {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm font-body">
                        {product.category}
                    </p>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        {product.originalPrice && (
                            <span className="text-gray-500 text-sm line-through font-body">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                        <span className="text-white font-medium text-lg font-body">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <button
                        className="size-10 rounded-full bg-[#282f39] text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="size-5" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
