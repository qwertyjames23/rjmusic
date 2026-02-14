"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, ProductVariant } from "@/types";

export function getProductFallbackImage(images: string[] | undefined): string {
    return images?.[0] || "/placeholder.png";
}

export function getVariantMainImage(
    productImages: string[] | undefined,
    variant: ProductVariant | null | undefined
): string {
    return variant?.image_url || getProductFallbackImage(productImages);
}

export function useSelectedVariantDisplay(product: Product) {
    const hasVariants = !!(product.has_variants && product.variants && product.variants.length > 0);
    const canonicalGroupName = useMemo(() => {
        const firstType = product.variants?.[0]?.variant_type?.trim();
        return firstType || "Variation";
    }, [product.variants]);

    const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
        if (!hasVariants) return {};
        return {};
    });

    const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(() => {
        return null;
    });

    useEffect(() => {
        if (!hasVariants || activeVariant) return;
        const variants = product.variants || [];
        if (variants.length === 0) return;
        const firstAvailable = variants.find((v) => Number(v.stock || 0) > 0) || variants[0];
        const timer = setTimeout(() => {
            setSelectedVariants({ [canonicalGroupName]: firstAvailable });
            setActiveVariant(firstAvailable);
        }, 0);
        return () => clearTimeout(timer);
    }, [hasVariants, activeVariant, product.variants, canonicalGroupName]);

    const allGroupsSelected = !hasVariants || !!activeVariant;
    const variantPrices = (product.variants || []).map((v) => Number(v.price || 0));
    const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
    const maxVariantPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0;
    const currentPrice = hasVariants ? (activeVariant?.price ?? minVariantPrice) : product.price;
    const currentStock = hasVariants ? (activeVariant?.stock ?? 0) : (product.stock ?? 0);
    const isInStock = hasVariants ? currentStock > 0 : product.inStock;
    const displayMainImage = activeVariant?.image_url || null;

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariants({ [canonicalGroupName]: variant });
        setActiveVariant(variant);
    };

    return {
        hasVariants,
        selectedVariants,
        activeVariant,
        allGroupsSelected,
        currentPrice,
        minVariantPrice,
        maxVariantPrice,
        currentStock,
        isInStock,
        displayMainImage,
        handleVariantSelect,
    };
}
