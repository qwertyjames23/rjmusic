"use client";

import { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { VariationSelector } from "./VariationSelector";

interface BuyBoxProps {
    product: Product;
    onVariantChange?: (variant: ProductVariant | null) => void;
}

export function BuyBox({ product, onVariantChange }: BuyBoxProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [quantity, setQuantity] = useState(1);
    const [user, setUser] = useState<User | null>(null);

    const hasVariants = product.has_variants && product.variants && product.variants.length > 0;

    // Default to first in-stock variant, or first variant
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
        if (!hasVariants) return null;
        const firstAvailable = product.variants!.find(v => v.stock > 0);
        return firstAvailable || product.variants![0] || null;
    });

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    // Notify parent of variant changes (e.g., to update gallery image)
    useEffect(() => {
        if (onVariantChange) {
            onVariantChange(selectedVariant);
        }
    }, [selectedVariant, onVariantChange]);

    // Derived values based on selected variant or base product
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.stock : (product.stock ?? 0);
    const isInStock = hasVariants
        ? (selectedVariant ? selectedVariant.stock > 0 : false)
        : product.inStock;

    // Reset quantity if it exceeds stock
    useEffect(() => {
        if (quantity > currentStock && currentStock > 0) {
            setQuantity(currentStock);
        }
    }, [currentStock, quantity]);

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity on variant change
    };

    const handleAddToCart = () => {
        if (!user) {
            router.push(`/login?next=${pathname}`);
            return;
        }

        // If product has variants, user must select one
        if (hasVariants && !selectedVariant) return;

        // Create a cart item with variant info
        const cartProduct = {
            ...product,
            // Override price with variant price
            price: currentPrice,
            // Store variant info
            selectedVariant: selectedVariant || undefined,
        };

        addToCart(cartProduct, quantity);
    };

    const fmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <div className="bg-[#1c222b] rounded-2xl p-6 border border-[#282f39] shadow-xl">
            {/* Price display */}
            {hasVariants && (
                <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-2xl font-bold text-primary">
                        {fmt.format(currentPrice)}
                    </span>
                    {product.originalPrice && currentPrice < product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {fmt.format(product.originalPrice)}
                        </span>
                    )}
                </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full animate-pulse", isInStock ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-xs font-bold uppercase tracking-wide", isInStock ? "text-green-500" : "text-red-500")}>
                        {isInStock
                            ? hasVariants && selectedVariant
                                ? `In Stock (${currentStock})`
                                : "In Stock"
                            : "Out of Stock"
                        }
                    </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Free shipping worldwide</span>
            </div>

            {/* Variation Selector */}
            {hasVariants && (
                <VariationSelector
                    variants={product.variants!}
                    selectedVariant={selectedVariant}
                    onSelect={handleVariantSelect}
                />
            )}

            {/* Finish Selector (only show for non-variant products) */}
            {!hasVariants && (
                <div className="mb-8">
                    <span className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">Finish</span>
                    <div className="flex gap-3">
                        <button
                            className="size-10 rounded-full border-2 border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-[#1c222b] transition-all relative"
                            title="Default"
                        >
                            <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#2a2a2a] to-black" />
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    {/* Quantity */}
                    <div className="flex items-center bg-[#13171d] rounded-lg border border-[#282f39] h-12 px-2 shrink-0">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || !isInStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white font-mono">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                            disabled={!isInStock || quantity >= currentStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    {/* Add To Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!isInStock || (hasVariants && !selectedVariant)}
                        className={cn(
                            "flex-1 h-12 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                            isInStock && (!hasVariants || selectedVariant)
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {isInStock ? (
                            <>
                                Add to Cart
                                <ArrowRight className="size-4" />
                            </>
                        ) : "Out of Stock"}
                    </button>
                </div>

                <button className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 py-1 group w-full">
                    <span className="border-b border-transparent group-hover:border-white/50 transition-colors">Add to Wishlist</span>
                </button>
            </div>
        </div>
    );
}
