"use client";

import { useState, useEffect, useMemo } from "react";
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

    // Group variants by type for multi-group selection
    const variantGroups = useMemo(() => {
        if (!hasVariants) return {};
        const groups: Record<string, ProductVariant[]> = {};
        for (const v of product.variants!) {
            const type = v.variant_type || "Variation";
            if (!groups[type]) groups[type] = [];
            groups[type].push(v);
        }
        return groups;
    }, [hasVariants, product.variants]);

    const groupNames = Object.keys(variantGroups);

    // Track selected variant per group — initialize with first in-stock variant of each group
    const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
        if (!hasVariants) return {};
        const initial: Record<string, ProductVariant> = {};
        for (const [groupName, variants] of Object.entries(variantGroups)) {
            const firstAvailable = variants.find(v => v.stock > 0);
            if (firstAvailable) initial[groupName] = firstAvailable;
            else if (variants[0]) initial[groupName] = variants[0];
        }
        return initial;
    });

    // The "primary" selected variant (used for price/stock) is the one most recently changed
    // or if there's only one group, it's just the selected variant from that group.
    // For pricing: we use the last selected variant's price (most relevant to user action)
    const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(() => {
        if (!hasVariants) return null;
        // Default: first group's selection
        const firstGroup = groupNames[0];
        return firstGroup ? (selectedVariants[firstGroup] || null) : null;
    });

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    // Notify parent of variant changes (e.g., to update gallery image)
    useEffect(() => {
        if (onVariantChange) {
            onVariantChange(activeVariant);
        }
    }, [activeVariant, onVariantChange]);

    // Derived values based on active variant or base product
    const currentPrice = activeVariant ? activeVariant.price : product.price;
    const currentStock = activeVariant ? activeVariant.stock : (product.stock ?? 0);
    const isInStock = hasVariants
        ? (activeVariant ? activeVariant.stock > 0 : false)
        : product.inStock;

    // Are all groups selected?
    const allGroupsSelected = groupNames.every(g => !!selectedVariants[g]);

    // Reset quantity if it exceeds stock
    useEffect(() => {
        if (quantity > currentStock && currentStock > 0) {
            setQuantity(currentStock);
        }
    }, [currentStock, quantity]);

    const handleVariantSelect = (variant: ProductVariant) => {
        const groupName = variant.variant_type || "Variation";
        setSelectedVariants(prev => ({ ...prev, [groupName]: variant }));
        setActiveVariant(variant);
        setQuantity(1); // Reset quantity on variant change
    };

    const handleAddToCart = () => {
        if (!user) {
            router.push(`/login?next=${pathname}`);
            return;
        }

        // If product has variants, user must select from each group
        if (hasVariants && !allGroupsSelected) return;

        // Create a cart item with variant info — use the active variant for price
        const cartProduct = {
            ...product,
            price: currentPrice,
            selectedVariant: activeVariant || undefined,
            // Store all selected variants info in description for order clarity
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
                        {currentPrice > 0 ? fmt.format(currentPrice) : "Unavailable"}
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
                            ? hasVariants && activeVariant
                                ? `In Stock (${currentStock})`
                                : "In Stock"
                            : "Out of Stock"
                        }
                    </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Free shipping worldwide</span>
            </div>

            {/* Variation Selectors (grouped by type) */}
            {hasVariants && (
                <VariationSelector
                    variants={product.variants!}
                    selectedVariants={selectedVariants}
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
                        disabled={!isInStock || (hasVariants && !allGroupsSelected)}
                        className={cn(
                            "flex-1 h-12 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                            isInStock && (!hasVariants || allGroupsSelected)
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
