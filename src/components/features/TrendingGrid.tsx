import { ProductCard } from "@/components/features/ProductCard";
import { products } from "@/lib/data";

export function TrendingGrid() {
    // Select first 4 products as trending
    const trendingProducts = products.slice(0, 4);

    return (
        <section className="py-12 bg-card/50">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-2xl font-bold leading-tight tracking-tight pb-6 text-foreground">TRENDING NOW</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trendingProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
