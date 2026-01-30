import Link from "next/link";
import { Search, ShoppingCart, User, Menu, Music, Mic, AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto h-16 px-4 md:px-6">
                <div className="flex h-full items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex size-8 items-center justify-center text-primary transition-transform group-hover:scale-110">
                            <AudioWaveform className="size-8" />
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-wider text-foreground">
                            RJ MUSIC
                        </h2>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/products?sort=new" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            New Arrivals
                        </Link>
                        <Link href="/brands" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Brands
                        </Link>
                        <Link href="/products?sale=true" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Sale
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex w-full max-w-xs items-center rounded-lg bg-secondary/50 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/20">
                            <Search className="mr-2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search gear..."
                                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                            />
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center gap-2">
                            <button className="md:hidden flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary/80 transition-colors">
                                <Search className="size-5" />
                            </button>

                            <Link href="/cart" className="relative flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary/80 transition-colors">
                                <ShoppingCart className="size-5" />
                                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
                            </Link>

                            <Link href="/profile" className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary/80 transition-colors">
                                <User className="size-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
