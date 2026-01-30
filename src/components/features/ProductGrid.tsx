"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/features/ProductCard";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    initialProducts: Product[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export function ProductGrid({ initialProducts }: ProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [initialProducts]);

    // Filter and Sort
    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        // Filter by Category
        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Sort
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                // Mock sorting by ID as proxy for date since we don't have dates
                result.sort((a, b) => Number(b.id) - Number(a.id));
                break;
            default:
                // Featured - keep original order or check for tags
                break;
        }

        return result;
    }, [initialProducts, selectedCategory, sortBy]);

    return (
        <div className="flex flex-col gap-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden flex items-center gap-2 text-sm font-medium border border-input rounded-md px-3 py-2 bg-background hover:bg-accent"
                >
                    <SlidersHorizontal className="size-4" />
                    Filters
                </button>

                <p className="hidden sm:block text-muted-foreground text-sm">
                    Showing <span className="text-foreground font-bold">{filteredProducts.length}</span> products
                </p>

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

                    {/* Price Range (Mock) */}
                    <div className="pt-6 border-t border-border">
                        <h3 className="font-bold mb-4">Price Range</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">₱0</span>
                                <span className="text-muted-foreground">₱200k+</span>
                            </div>
                            <input type="range" className="w-full accent-primary" />
                        </div>
                    </div>
                </aside>

                {/* Grid */}
                <main className="flex-1">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
