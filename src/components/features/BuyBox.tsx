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
import { useSelectedVariantDisplay } from "@/hooks/useSelectedVariantDisplay";

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

    const {
        hasVariants,
        selectedVariants,
        activeVariant,
        allGroupsSelected,
        currentPrice,
        minVariantPrice,
        maxVariantPrice,
        currentStock,
        isInStock,
        handleVariantSelect,
    } = useSelectedVariantDisplay(product);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    useEffect(() => {
        if (onVariantChange) {
            onVariantChange(activeVariant);
        }

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("rjmusic:variant-change", {
                detail: {
                    productId: product.id,
                    variant: activeVariant,
                },
            }));
        }
    }, [activeVariant, onVariantChange, product.id]);

    const effectiveStock = Math.max(currentStock, 0);
    const effectiveQuantity = Math.min(quantity, effectiveStock || 1);

    const handleSelectVariant = (variant: ProductVariant) => {
        handleVariantSelect(variant);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (!user) {
            router.push(`/login?next=${pathname}`);
            return;
        }

        if (hasVariants && !allGroupsSelected) return;

        const cartProduct = {
            ...product,
            price: currentPrice,
            selectedVariant: activeVariant || undefined,
        };

        addToCart(cartProduct, effectiveQuantity);
    };

    const fmt = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

    return (
        <div className="bg-[#1c222b] rounded-2xl p-6 border border-[#282f39] shadow-xl">
            {hasVariants && (
                <div className="flex items-baseline gap-3 mb-5">
                    {activeVariant ? (
                        <>
                            <span className="text-2xl font-bold text-primary">
                                {currentPrice > 0 ? fmt.format(currentPrice) : "Unavailable"}
                            </span>
                            {product.originalPrice && currentPrice < product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {fmt.format(product.originalPrice)}
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-gray-400">From</span>
                            <span className="text-2xl font-bold text-primary">{fmt.format(minVariantPrice)}</span>
                            {maxVariantPrice > minVariantPrice && (
                                <span className="text-2xl font-bold text-primary">{fmt.format(maxVariantPrice)}</span>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full animate-pulse", isInStock ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-xs font-bold uppercase tracking-wide", isInStock ? "text-green-500" : "text-red-500")}>
                        {isInStock
                            ? hasVariants && activeVariant
                                ? `In Stock (${effectiveStock})`
                                : "Select a variation"
                            : (hasVariants && !activeVariant ? "Select a variation" : "Out of Stock")
                        }
                    </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Free shipping worldwide</span>
            </div>

            {hasVariants && (
                <VariationSelector
                    variants={product.variants!}
                    selectedVariants={selectedVariants}
                    onSelect={handleSelectVariant}
                />
            )}

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

            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="flex items-center bg-[#13171d] rounded-lg border border-[#282f39] h-12 px-2 shrink-0">
                        <button
                            onClick={() => setQuantity(Math.max(1, effectiveQuantity - 1))}
                            disabled={effectiveQuantity <= 1 || !isInStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white font-mono">{effectiveQuantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(effectiveStock || 99, effectiveQuantity + 1))}
                            disabled={!isInStock || effectiveQuantity >= effectiveStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

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
                        ) : (hasVariants && !activeVariant ? "Select Variation" : "Out of Stock")}
                    </button>
                </div>

                <button className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 py-1 group w-full">
                    <span className="border-b border-transparent group-hover:border-white/50 transition-colors">Add to Wishlist</span>
                </button>
            </div>
        </div>
    );
}
