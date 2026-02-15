import { Hero } from "@/components/features/Hero";
import { CategoryGrid } from "@/components/features/CategoryGrid";
import { getProducts } from "@/lib/data";
import { TrendingProductCard } from "@/components/features/TrendingProductCard";
import { Mail, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export const revalidate = 3600; // Revalidate at most every hour


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
            <div className="text-primary"><Truck className="size-6" /></div>
            <div>
              <h3 className="font-bold text-sm text-white">FREE SHIPPING ON ORDERS OVER ₱25,000</h3>
              <p className="text-xs text-gray-400">Insured delivery on all premium instruments.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-primary"><ShieldCheck className="size-6" /></div>
            <div>
              <h3 className="font-bold text-sm text-white">AUTHORIZED DEALER</h3>
              <p className="text-xs text-gray-400">Fender, Gibson, Roland, Yamaha & more.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="text-primary"><RotateCcw className="size-6" /></div>
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
            {trendingProducts.length > 0 ? (
              trendingProducts.map(product => (
                <TrendingProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-gray-400 col-span-full">No trending products found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#0a0d11] text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Mail className="size-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Join the Inner Circle</h2>
          <p className="text-gray-400 mb-8">Get early access to drops, exclusive artist interviews, and 10% off your first order.</p>
          <form className="flex flex-col sm:flex-row gap-4" action="#">
            <input type="email" required placeholder="Enter your email address" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            <button type="button" className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">SUBSCRIBE</button>
          </form>
        </div>
      </section>
    </div>
  );
}
