import { Hero } from "@/components/features/Hero";
import { CategoryGrid } from "@/components/features/CategoryGrid";
import { Mail } from "lucide-react";

export const revalidate = 3600; // Revalidate at most every hour


export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <CategoryGrid />
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#0a0d11] text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Mail className="size-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">STAY IN TUNE</h2>
          <p className="text-gray-400 mb-8">Get updates on new gear arrivals, exclusive deals, and musician tips delivered to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4" action="#">
            <input type="email" required placeholder="Enter your email address" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            <button type="button" className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">SUBSCRIBE</button>
          </form>
        </div>
      </section>
    </div>
  );
}
