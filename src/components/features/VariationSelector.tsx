"use client";

import { ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface VariationSelectorProps {
    variants: ProductVariant[];
    selectedVariant: ProductVariant | null;
    onSelect: (variant: ProductVariant) => void;
}

export function VariationSelector({ variants, selectedVariant, onSelect }: VariationSelectorProps) {
    if (!variants || variants.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Package className="size-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Variation
                </span>
                {selectedVariant && (
                    <span className="text-xs text-primary font-medium ml-auto">
                        {selectedVariant.label}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock <= 0;

                    return (
                        <button
                            key={variant.id}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && onSelect(variant)}
                            className={cn(
                                "relative px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                                isSelected
                                    ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                                    : isOutOfStock
                                        ? "border-[#282f39] bg-[#13171d] text-gray-600 cursor-not-allowed opacity-50"
                                        : "border-[#282f39] bg-[#1c222b] text-gray-300 hover:border-primary/40 hover:text-white hover:bg-[#232a35] cursor-pointer",
                            )}
                            title={isOutOfStock ? `${variant.label} — Out of stock` : variant.label}
                        >
                            {variant.label}

                            {/* Out of stock diagonal line */}
                            {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-px bg-gray-600 rotate-[-20deg]" />
                                </div>
                            )}

                            {/* Selected checkmark indicator */}
                            {isSelected && (
                                <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
                                    <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Stock info for selected variant */}
            {selectedVariant && (
                <div className="mt-2 flex items-center gap-1.5">
                    <span className={cn(
                        "size-1.5 rounded-full",
                        selectedVariant.stock > 5 ? "bg-green-500" :
                            selectedVariant.stock > 0 ? "bg-orange-500 animate-pulse" : "bg-red-500"
                    )} />
                    <span className={cn(
                        "text-xs font-medium",
                        selectedVariant.stock > 5 ? "text-green-500" :
                            selectedVariant.stock > 0 ? "text-orange-500" : "text-red-500"
                    )}>
                        {selectedVariant.stock > 5
                            ? `${selectedVariant.stock} in stock`
                            : selectedVariant.stock > 0
                                ? `Only ${selectedVariant.stock} left`
                                : "Out of stock"
                        }
                    </span>
                </div>
            )}
        </div>
    );
}
