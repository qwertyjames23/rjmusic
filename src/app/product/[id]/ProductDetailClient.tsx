"use client";

import { useState, useCallback } from "react";
import { Product, ProductVariant } from "@/types";
import { ProductGallery } from "@/components/features/ProductGallery";

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [variantImage, setVariantImage] = useState<string | null>(null);

    // When a variant is selected that has a custom image, show it
    const handleVariantChange = useCallback((variant: ProductVariant | null) => {
        if (variant?.image_url) {
            setVariantImage(variant.image_url);
        } else {
            setVariantImage(null);
        }
    }, []);

    // Build images array — if variant has image, prepend it
    const displayImages = variantImage
        ? [variantImage, ...product.images.filter(img => img !== variantImage)]
        : product.images;

    return (
        <ProductGallery
            images={displayImages}
            productName={product.name}
            productTag={product.tags?.[0]}
        />
    );
}
