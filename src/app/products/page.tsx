import { ProductGrid } from "@/components/features/ProductGrid";
import { products } from "@/lib/data";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Products | MUSIC',
    description: 'Browse our extensive catalog of musical instruments and equipment.',
};

export default function ProductsPage({ searchParams }: { searchParams: { search?: string } }) {
    const isSearch = searchParams?.search && searchParams.search.length > 0;
    const title = isSearch ? "Search Results" : "Shop All";
    const description = isSearch
        ? `Found items matching "${searchParams.search}"`
        : "Browse our curated collection of professional musical instruments.";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
                <p className="text-muted-foreground max-w-2xl">
                    {description}
                </p>
            </div>

            <ProductGrid initialProducts={products} />
        </div>
    );
}
