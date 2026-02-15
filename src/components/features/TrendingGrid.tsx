"use client";

import { Product } from "@/types";
import { TrendingProductCard } from "./TrendingProductCard";

export function TrendingGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return <p className="text-gray-400 col-span-full">No trending products found.</p>;
    }

    return (
        <>
            {products.map(product => (
                <TrendingProductCard key={product.id} product={product} />
            ))}
        </>
    );
}
