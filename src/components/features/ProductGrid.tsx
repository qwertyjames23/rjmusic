"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/features/ProductCard";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface ProductGridProps {
    initialProducts: Product[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export function ProductGrid({ initialProducts }: ProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [showFilters, setShowFilters] = useState(false);

    // Search Params
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("search")?.toLowerCase() || "";

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [initialProducts]);

    // Price Range State
    const maxProductPrice = initialProducts.length > 0 ? Math.max(...initialProducts.map(p => p.price)) : 10000;
    const safeMaxPrice = Math.max(maxProductPrice, 1);
    const minGap = Math.max(Math.round(safeMaxPrice * 0.02), 1);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);

    // Update filter logic to include price range
    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        // Filter by Search Term
        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by Category
        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Filter by Price Range
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Sort
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => Number(b.id) - Number(a.id));
                break;
            default:
                break;
        }

        return result;
    }, [initialProducts, selectedCategory, sortBy, searchTerm, priceRange]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), Math.max(0, priceRange[1] - minGap)); // Prevent overlapping
        setPriceRange([val, priceRange[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), Math.min(safeMaxPrice, priceRange[0] + minGap)); // Prevent overlapping
        setPriceRange([priceRange[0], val]);
    };

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
            notation: "compact"
        }).format(price);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden flex items-center gap-2 text-sm font-medium border border-input rounded-md px-3 py-2 bg-background hover:bg-accent"
                >
                    <SlidersHorizontal className="size-4" />
                    Filters
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-background border border-input rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-accent/50"
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 size-4 opacity-50 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className={cn(
                    "w-full md:w-64 space-y-8",
                    showFilters ? "block" : "hidden md:block" // Toggle on mobile
                )}>
                    {/* Categories */}
                    <div>
                        <h3 className="font-bold mb-4">Categories</h3>
                        <div className="flex flex-col gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center justify-between group",
                                        selectedCategory === cat
                                            ? "bg-secondary font-medium text-foreground"
                                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                    )}
                                >
                                    {cat}
                                    {selectedCategory === cat && <Check className="size-3.5 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="pt-6 border-t border-border">
                        <h3 className="font-bold mb-4">Price Range</h3>
                        <div className="space-y-6">


                            {/* Re-implementing with standard robust CSS dual slider technique */}
                            <div className="relative h-2 w-full overflow-hidden">
                                <input
                                    type="range"
                                    min={0}
                                    max={safeMaxPrice}
                                    value={priceRange[0]}
                                    onChange={handleMinChange}
                                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none pointer-events-none z-[11] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={safeMaxPrice}
                                    value={priceRange[1]}
                                    onChange={handleMaxChange}
                                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none pointer-events-none z-[12] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-secondary h-2 z-[10]"></div>
                                <div
                                    className="absolute top-0 h-2 bg-primary rounded-full z-[10]"
                                    style={{
                                        left: `${(priceRange[0] / safeMaxPrice) * 100}%`,
                                        right: `${100 - (priceRange[1] / safeMaxPrice) * 100}%`
                                    }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between font-mono text-xs font-bold text-muted-foreground">
                                <span>{formatPrice(priceRange[0])}</span>
                                <span>{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Grid */}
                <main className="flex-1">
                    {filteredProducts.length > 0 ? (
                        <div
                            key={selectedCategory + sortBy + searchTerm}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-2"
                        >
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-muted-foreground text-lg mb-2">No products found.</p>
                            <button
                                onClick={() => setSelectedCategory("All")}
                                className="text-primary font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
