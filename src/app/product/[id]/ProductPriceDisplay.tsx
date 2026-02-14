"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, ProductVariant } from "@/types";

interface ProductPriceDisplayProps {
    product: Product;
}

export function ProductPriceDisplay({ product }: ProductPriceDisplayProps) {
    const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
    const fmt = useMemo(() => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }), []);

    useEffect(() => {
        const handleVariantChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ productId?: string; variant?: ProductVariant | null }>;
            const selectedProductId = customEvent.detail?.productId;
            if (selectedProductId && selectedProductId !== product.id) return;
            setActiveVariant(customEvent.detail?.variant ?? null);
        };

        window.addEventListener("rjmusic:variant-change", handleVariantChange as EventListener);
        return () => window.removeEventListener("rjmusic:variant-change", handleVariantChange as EventListener);
    }, [product.id]);

    if (!product.has_variants || !product.variants || product.variants.length === 0) {
        return (
            <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">{fmt.format(product.price)}</span>
                {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                        {fmt.format(product.originalPrice)}
                    </span>
                )}
            </div>
        );
    }

    if (activeVariant) {
        return (
            <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">{fmt.format(activeVariant.price)}</span>
            </div>
        );
    }

    const prices = product.variants.map((v) => Number(v.price || 0));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return (
        <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-3xl font-bold text-primary">{fmt.format(min)}</span>
            {max > min && <span className="text-3xl font-bold text-primary">{fmt.format(max)}</span>}
        </div>
    );
}
