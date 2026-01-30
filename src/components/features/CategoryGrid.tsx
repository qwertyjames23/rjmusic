import Link from "next/link";
import { Music, Mic, Piano, Disc, Headphones, ArrowRight } from "lucide-react";

const categories = [
    { name: "Guitars", icon: Music, href: "/products?category=guitars" },
    { name: "Keys", icon: Piano, href: "/products?category=keys" },
    { name: "Percussion", icon: Disc, href: "/products?category=percussion" },
    { name: "Studio", icon: Mic, href: "/products?category=studio" },
    { name: "Accessories", icon: Headphones, href: "/products?category=accessories" },
];

export function CategoryGrid() {
    return (
        <section className="py-12 md:py-20 bg-[#050505]">
            <div className="container mx-auto px-4 md:px-10">
                <div className="flex items-end justify-between pb-8">
                    <h2 className="text-white text-3xl font-bold leading-tight tracking-tight font-display">BROWSE CATEGORIES</h2>
                    <Link href="/products" className="text-primary text-sm font-bold hover:text-white transition-colors flex items-center gap-1 font-display">
                        View All <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="group flex flex-col gap-4 rounded-xl border border-[#282f39] bg-[#1a1a1a] hover:border-primary/50 hover:bg-[#202833] p-6 items-center justify-center transition-all duration-300"
                        >
                            <div className="size-16 rounded-full bg-[#11161d] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                <cat.icon className="size-8" />
                            </div>
                            <h3 className="text-white text-base font-bold tracking-wide font-display">{cat.name}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
