import { Hero } from "@/components/features/Hero";
import { CategoryGrid } from "@/components/features/CategoryGrid";
import { TrendingGrid } from "@/components/features/TrendingGrid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <CategoryGrid />
      <TrendingGrid />

      {/* Newsletter Section */}
      <section className="py-20 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl md:text-4xl font-black leading-tight">JOIN THE INNER CIRCLE</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Get early access to drops, exclusive artist interviews, and 10% off your first order.
          </p>
          <div className="flex w-full max-w-md flex-col md:flex-row gap-3 mt-4">
            <input
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Enter your email address"
            />
            <button className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
