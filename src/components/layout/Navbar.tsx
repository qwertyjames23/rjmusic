"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, AudioWaveform } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
    const { cartCount } = useCart();

    return (
        <header className="sticky top-0 z-50 border-b border-[#282f39] bg-[#050505]/80 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto h-16 md:h-auto md:py-3 px-4 md:px-10">
                <div className="flex h-full items-center justify-between gap-4">

                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex size-8 items-center justify-center text-primary transition-transform group-hover:scale-110">
                                <AudioWaveform className="size-8" />
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
                        <div className="hidden md:flex w-full max-w-[250px] lg:max-w-xs items-center rounded-lg bg-[#1c222b] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all group">
                            <div className="text-[#9da8b9] flex items-center justify-center pr-2 border-r border-[#282f39] h-4">
                                <Search className="size-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search gear..."
                                className="flex-1 bg-transparent text-white placeholder-[#5f6b7c] outline-none pl-3 h-full font-normal"
                            />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-2">
                            <button className="md:hidden flex size-10 items-center justify-center rounded-full text-white hover:bg-[#282f39] transition-colors">
                                <Search className="size-5" />
                            </button>

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
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
