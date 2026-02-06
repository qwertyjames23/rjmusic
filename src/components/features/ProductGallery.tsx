"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    productName: string;
    productTag?: string; // Optional tag like "SALE" or "NEW"
}

export function ProductGallery({ images, productName, productTag }: ProductGalleryProps) {
    // Default to first image
    const [mainImage, setMainImage] = useState(images[0] || '/placeholder.png'); // Fallback placeholder
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image View */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#282f39] bg-[#1a1f26] group">
                <Image
                    src={mainImage}
                    alt={productName}
                    fill
                    className="object-contain object-center transition-transform duration-700 group-hover:scale-105"
                    priority
                />

                {/* Optional Tag Overlay */}
                {productTag && (
                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg shadow-black/20">
                        {productTag}
                    </span>
                )}
            </div>

            {/* Thumbnails Grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setMainImage(img);
                                setSelectedIndex(idx);
                            }}
                            className={cn(
                                "relative aspect-square rounded-lg border bg-[#1a1f26] overflow-hidden transition-all",
                                selectedIndex === idx
                                    ? "border-primary ring-2 ring-primary/20 opacity-100"
                                    : "border-[#282f39] opacity-60 hover:opacity-100 hover:border-gray-500"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} view ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
