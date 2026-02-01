import { Suspense } from "react";
import { ProductGrid } from "@/components/features/ProductGrid";
import { products } from "@/lib/data";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Products | MUSIC',
    description: 'Browse our extensive catalog of musical instruments and equipment.',
};

export default function ProductsPage() {


    return (
        <div className="container mx-auto px-4 py-8">


            <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
                <ProductGrid initialProducts={products} />
            </Suspense>
        </div>
    );
}
