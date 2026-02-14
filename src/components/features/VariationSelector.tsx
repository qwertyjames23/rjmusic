"use client";

import { ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface VariationSelectorProps {
    variants: ProductVariant[];
    selectedVariants: Record<string, ProductVariant>;
    onSelect: (variant: ProductVariant) => void;
}

export function VariationSelector({ variants, selectedVariants, onSelect }: VariationSelectorProps) {
    if (!variants || variants.length === 0) return null;

    const variationType = variants[0]?.variant_type || "Variation";
    const selected = selectedVariants[variationType] || Object.values(selectedVariants)[0] || null;

    return (
        <div className="space-y-5 mb-6">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Package className="size-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {variationType}
                    </span>
                    {selected && (
                        <span className="text-xs text-primary font-medium ml-auto">
                            {selected.label}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                        const isSelected = selected?.id === variant.id;
                        const isOutOfStock = variant.stock <= 0;

                        return (
                            <button
                                key={variant.id}
                                type="button"
                                onClick={() => onSelect(variant)}
                                className={cn(
                                    "relative px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                                    isSelected
                                        ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                                        : isOutOfStock
                                            ? "border-[#282f39] bg-[#13171d] text-gray-400 opacity-70 hover:border-primary/30 cursor-pointer"
                                            : "border-[#282f39] bg-[#1c222b] text-gray-300 hover:border-primary/40 hover:text-white hover:bg-[#232a35] cursor-pointer",
                                )}
                                title={isOutOfStock ? `${variant.label} - Out of stock` : variant.label}
                            >
                                {variant.label}

                                {isOutOfStock && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-px bg-gray-600 rotate-[-20deg]" />
                                    </div>
                                )}

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

                {selected && (
                    <div className="mt-2 flex items-center gap-1.5">
                        <span className={cn(
                            "size-1.5 rounded-full",
                            selected.stock > 5 ? "bg-green-500" :
                                selected.stock > 0 ? "bg-orange-500 animate-pulse" : "bg-red-500"
                        )} />
                        <span className={cn(
                            "text-xs font-medium",
                            selected.stock > 5 ? "text-green-500" :
                                selected.stock > 0 ? "text-orange-500" : "text-red-500"
                        )}>
                            {selected.stock > 5
                                ? `${selected.stock} in stock`
                                : selected.stock > 0
                                    ? `Only ${selected.stock} left`
                                    : "Out of stock"
                            }
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
