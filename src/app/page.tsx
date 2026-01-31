import { Suspense } from "react";
import { ProductGrid } from "@/components/features/ProductGrid";
import { products } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">SHOP ALL</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse our curated collection of professional musical instruments and studio equipment.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading products...</div>}>
        <ProductGrid initialProducts={products} />
      </Suspense>
    </div>
  );
}
