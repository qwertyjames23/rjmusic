"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
    const { cartCount } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const term = searchQuery.trim();
        setIsMobileMenuOpen(false); // Close menu on search
        if (!term) {
            router.push("/products");
            return;
        }
        router.push(`/products?search=${encodeURIComponent(term)}`);
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
                                MUSIC
                            </h2>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/?sort=new" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                New Arrivals
                            </Link>
                            <Link href="/brands" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                Brands
                            </Link>
                            <Link href="/?sale=true" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                Sale
                            </Link>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
                        {/* Search Bar (Desktop) */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden md:flex w-full max-w-[250px] lg:max-w-xs items-center rounded-lg bg-[#1c222b] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all group"
                        >
                            <button
                                type="submit"
                                className="text-[#9da8b9] flex items-center justify-center pr-2 border-r border-[#282f39] h-4 cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0"
                            >
                                <Search className="size-4" />
                            </button>
                            <input
                                type="text"
                                placeholder="Search gear..."
                                className="flex-1 bg-transparent text-white placeholder-[#5f6b7c] outline-none pl-3 h-full font-normal"
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    if (val === "" && pathname === "/products") {
                                        router.push("/products");
                                    }
                                }}
                            />
                        </form>

                        {/* Icons */}
                        <div className="flex items-center gap-2">
                            <Link
                                href="/cart"
                                className="relative flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/profile"
                                className="flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors"
                                aria-label="User Profile"
                            >
                                <User className="size-5" />
                            </Link>

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
                        onSubmit={handleSearch}
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
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                if (val === "" && pathname === "/products") {
                                    router.push("/products");
                                }
                            }}
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
                        <Link
                            href="/brands"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                            Brands
                        </Link>
                        <Link
                            href="/?sale=true"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-300 hover:text-white hover:bg-[#1c222b] px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                            Sale
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
