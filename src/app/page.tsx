import { Hero } from "@/components/features/Hero";
import { CategoryGrid } from "@/components/features/CategoryGrid";
// import { TrendingGrid } from "@/components/features/TrendingGrid"; // Disabling mock trending logic
import { ProductGrid } from "@/components/features/ProductGrid";
// import { products } from "@/lib/data"; // Removed mock data
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import Link from "next/link";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category,
    brand: p.brand,
    images: p.images || [],
    inStock: p.in_stock,
    rating: Number(p.rating),
    reviews: Number(p.reviews),
    tags: p.tags || [],
    features: p.features || [],
  }));
}

export default async function Home() {
  const trendingProducts = await getProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features / USPs */}
      <div className="bg-[#0f141a] py-6 border-y border-white/5">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
            <div>
              <h3 className="font-bold text-sm text-white">FREE SHIPPING ON ORDERS OVER ₱25,000</h3>
              <p className="text-xs text-gray-400">Insured delivery on all premium instruments.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
            <div>
              <h3 className="font-bold text-sm text-white">AUTHORIZED DEALER</h3>
              <p className="text-xs text-gray-400">Fender, Gibson, Roland, Yamaha & more.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg></div>
            <div>
              <h3 className="font-bold text-sm text-white">30-DAY RETURNS</h3>
              <p className="text-xs text-gray-400">Shop with total confidence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <CategoryGrid />
      </section>

      {/* Trending / Featured */}
      <section className="py-16 bg-[#0f141a]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-wider">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reusing Product Card for Trending, or we could use a dedicated component */}
            {/* We map the products here directly to avoid bringing back the old TrendingGrid if it was static */}
            {trendingProducts.map(product => (
              <div key={product.id} className="group relative bg-[#151b24] border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                {/* Simple Card for Trending */}
                <Link href={`/product/${product.id}`} className="block aspect-square relative bg-white/5">
                  {/* Use next/image or standard img for now - ProductCard handles this better, but let's inline for simplicity match layout or reuse ProductCard? */}
                  {/* Actually, let's just reuse ProductCard but import it inside map? No, cleaner to map. */}
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.tags?.includes("SALE") && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">SALE</span>}
                  {product.tags?.includes("NEW") && <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded">NEW</span>}
                </Link>
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(product.price)}
                    </span>
                    <Link href={`/product/${product.id}`} className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#0a0d11] text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Mail className="size-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Join the Inner Circle</h2>
          <p className="text-gray-400 mb-8">Get early access to drops, exclusive artist interviews, and 10% off your first order.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="email" placeholder="Enter your email address" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            <button className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">SUBSCRIBE</button>
          </div>
        </div>
      </section>
    </div>
  );
}
