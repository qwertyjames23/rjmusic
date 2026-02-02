"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { mockProducts } from "@/lib/data";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";

export function Navbar() {
    const { cartCount } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search State
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Click outside to close search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check Auth State for Badge & Cart Access
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setIsAuthLoading(false); // Auth check complete
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsAuthLoading(false); // Auth check complete
        });
        return () => subscription.unsubscribe();
    }, []);

    // Hide Navbar on Admin pages
    if (pathname && pathname.startsWith('/admin')) return null;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length > 0) {
            // Simulate slight delay for realism or just filter
            const filtered = mockProducts.filter((p: Product) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.brand.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSearchResults(filtered);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };


    const handleCartClick = () => {
        if (user) {
            router.push('/cart');
        } else {
            router.push('/login?next=/cart');
        }
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        setShowResults(false);
        const term = searchQuery.trim();
        setIsMobileMenuOpen(false);
        if (!term) return;
        router.push(`/products?search=${encodeURIComponent(term)}`);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setShowResults(false);
        setSearchResults([]);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 border-b border-[#282f39] bg-[#050505]/80 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto h-16 md:h-auto md:py-3 px-4 md:px-10">
                <div className="flex h-full items-center justify-between gap-4">

                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative h-10 w-10 transition-transform group-hover:scale-110">
                                <Image
                                    src="/logo.png"
                                    alt="RJ Music Logo"
                                    fill
                                    className="object-contain invert" // Invert for dark mode/dark header
                                    sizes="40px"
                                />
                            </div>
                            <h2 className="text-xl font-bold leading-tight tracking-wider text-white font-display">
                                RJ MUSIC
                            </h2>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/?sort=new" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                New Arrivals
                            </Link>
                            {/* <Link href="/brands" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                Brands
                            </Link> */}
                            <Link href="/products?tags=SALE" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                Sale
                            </Link>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">

                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:block relative w-full max-w-[300px]" ref={searchRef}>
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex w-full items-center rounded-lg bg-[#1c222b] border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all text-sm"
                            >
                                <button
                                    type="submit"
                                    className="text-[#9da8b9] flex items-center justify-center pl-3 h-10 cursor-pointer hover:text-white transition-colors bg-transparent border-none"
                                >
                                    <Search className="size-4" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Search gear..."
                                    className="flex-1 bg-transparent text-white placeholder-[#5f6b7c] outline-none px-3 h-10 font-normal w-full"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="pr-3 text-[#9da8b9] hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </form>

                            {/* Dropdown Results */}
                            {showResults && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Products
                                            </div>
                                            {searchResults.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors group"
                                                >
                                                    <div className="relative size-10 rounded bg-secondary/30 overflow-hidden shrink-0">
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {product.brand}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs font-bold text-foreground">
                                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(product.price)}
                                                    </div>
                                                </Link>
                                            ))}
                                            <div className="border-t border-border mt-1 pt-1">
                                                <button
                                                    onClick={handleSearchSubmit}
                                                    className="w-full text-left px-3 py-2 text-xs font-bold text-primary hover:bg-secondary/30 flex items-center justify-between"
                                                >
                                                    See all results for &quot;{searchQuery}&quot;
                                                    <ChevronRight className="size-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <p className="text-sm">No products found for &quot;{searchQuery}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCartClick}
                                className="relative flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && user && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Show Profile Icon if logged in, otherwise show Login/Register */}
                            {isAuthLoading ? (
                                // Loading skeleton - prevents flash of unauthenticated content
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="size-10 rounded-full bg-[#282f39] animate-pulse" />
                                </div>
                            ) : user ? (
                                <Link
                                    href="/profile"
                                    className="flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors"
                                    aria-label="User Profile"
                                >
                                    <User className="size-5" />
                                </Link>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Menu"
                            >
                                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-[#282f39] p-4 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Mobile Search */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full items-center rounded-lg bg-[#1c222b] px-3 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all"
                    >
                        <button type="submit" className="text-[#9da8b9] pr-3">
                            <Search className="size-4" />
                        </button>
                        <input
                            type="text"
                            placeholder="Search gear..."
                            className="flex-1 bg-transparent text-white placeholder-[#5f6b7c] outline-none font-normal"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Mobile Links */}
                    <nav className="flex flex-col space-y-2">
                        <Link
                            href="/?sort=new"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                            New Arrivals
                        </Link>
                        {/* <Link
                            href="/brands"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                            Brands
                        </Link> */}
                        <Link
                            href="/?sale=true"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                            Sale
                        </Link>

                        {/* Mobile Auth Links */}
                        <div className="border-t border-[#282f39] pt-2 mt-2">
                            {isAuthLoading ? (
                                // Loading skeleton
                                <div className="px-4 py-3">
                                    <div className="h-10 rounded-lg bg-[#282f39] animate-pulse" />
                                </div>
                            ) : user ? (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <User className="size-4" />
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="text-center text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-center text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-center bg-primary text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
