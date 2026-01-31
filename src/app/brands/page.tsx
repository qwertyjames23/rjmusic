"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Mock Brands Data
const brands = [
    {
        id: 1,
        name: "Fender",
        description: "The spirit of rock-n-roll since 1946. Iconic guitars and amps.",
        logo: "/brands/fender.png", // We'll use a placeholder or stylized text if logo missing
        image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=2070&auto=format&fit=crop",
        featured: true
    },
    {
        id: 2,
        name: "Shure",
        description: "Legendary microphones and audio electronics.",
        logo: "/brands/shure.png",
        image: "https://images.unsplash.com/photo-1590483000696-52200512f384?q=80&w=2000&auto=format&fit=crop",
        featured: true
    },
    {
        id: 3,
        name: "Korg",
        description: "Innovative synthesizers and electronic instruments.",
        logo: "/brands/korg.png",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
        featured: true
    },
    {
        id: 4,
        name: "Roland",
        description: "Defining the sound of modern music.",
        logo: "/brands/roland.png",
        image: "https://images.unsplash.com/photo-1519508234439-0433553e1293?q=80&w=2070&auto=format&fit=crop",
        featured: false
    },
    {
        id: 5,
        name: "Yamaha",
        description: "World's largest musical instrument manufacturer.",
        logo: "/brands/yamaha.png",
        image: "https://images.unsplash.com/photo-1545167622-3a6ac156f422?q=80&w=2072&auto=format&fit=crop",
        featured: false
    },
    {
        id: 6,
        name: "Audio-Technica",
        description: "Audio equipment for professional and home use.",
        logo: "/brands/at.png",
        image: "https://images.unsplash.com/photo-1615247001958-f4bc92fa5a26?q=80&w=1964&auto=format&fit=crop",
        featured: false
    },
    {
        id: 7,
        name: "Nord",
        description: "Handmade keyboards from Sweden.",
        logo: "/brands/nord.png",
        image: "https://images.unsplash.com/photo-1621544275034-72909405625c?q=80&w=2070&auto=format&fit=crop",
        featured: false
    },
    {
        id: 8,
        name: "Gibson",
        description: "The sound of generations.",
        logo: "/brands/gibson.png",
        image: "https://images.unsplash.com/photo-1550985543-f4423c638e52?q=80&w=2074&auto=format&fit=crop",
        featured: false
    }
];

export default function BrandsPage() {
    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex flex-col gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">Our Brands</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    We partner with the world's most trusted manufacturers to bring you professional-grade equipment.
                </p>
            </div>

            {/* Featured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {brands.filter(b => b.featured).map(brand => (
                    <Link
                        key={brand.id}
                        href={`/products?search=${brand.name.toLowerCase()}`}
                        className="group relative h-[300px] overflow-hidden rounded-2xl border border-border bg-card"
                    >
                        <Image
                            src={brand.image}
                            alt={brand.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-end">
                            <h3 className="text-2xl font-bold text-white mb-2 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">{brand.name}</h3>
                            <p className="text-gray-300 text-sm opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                                {brand.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <h2 className="text-2xl font-bold mb-6">All Brands</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {brands.map(brand => (
                    <Link
                        key={brand.id}
                        href={`/products?search=${brand.name.toLowerCase()}`}
                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all hover:-translate-y-1 group"
                    >
                        <div className="size-16 rounded-full bg-secondary flex items-center justify-center text-xl font-black text-muted-foreground group-hover:text-primary transition-colors">
                            {brand.name[0]}
                        </div>
                        <span className="font-bold text-center group-hover:text-primary transition-colors">{brand.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
