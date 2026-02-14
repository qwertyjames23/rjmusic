"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, ProductVariant } from "@/types";
import { ProductGallery } from "@/components/features/ProductGallery";
import { getProductFallbackImage } from "@/hooks/useSelectedVariantDisplay";

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const fallbackImage = getProductFallbackImage(product.images);

    const baseImages = useMemo(() => {
        if (product.images.length > 0) return product.images;
        return [fallbackImage];
    }, [product.images, fallbackImage]);

    const variantImages = useMemo(() => {
        const seen = new Set(baseImages);
        const collected: string[] = [];

        for (const variant of product.variants || []) {
            const image = variant.image_url || null;
            if (!image || seen.has(image)) continue;
            seen.add(image);
            collected.push(image);
        }

        return collected;
    }, [baseImages, product.variants]);

    const galleryImages = useMemo(() => [...baseImages, ...variantImages], [baseImages, variantImages]);
    const [mainImage, setMainImage] = useState(baseImages[0]);

    useEffect(() => {
        for (const image of galleryImages) {
            const img = new window.Image();
            img.src = image;
        }
    }, [galleryImages]);

    useEffect(() => {
        const handleVariantChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ productId?: string; variant?: ProductVariant | null }>;
            const selectedProductId = customEvent.detail?.productId;
            if (selectedProductId && selectedProductId !== product.id) return;

            const variant = customEvent.detail?.variant ?? null;
            setMainImage(variant?.image_url || baseImages[0]);
        };

        window.addEventListener("rjmusic:variant-change", handleVariantChange as EventListener);
        return () => {
            window.removeEventListener("rjmusic:variant-change", handleVariantChange as EventListener);
        };
    }, [product.id, baseImages]);

    return (
        <ProductGallery
            images={galleryImages}
            mainImage={mainImage}
            onMainImageChange={setMainImage}
            productName={product.name}
            productTag={product.tags?.[0]}
        />
    );
}
