"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Store, Truck, ShoppingCart, Star, RotateCcw, CheckCircle2 } from "lucide-react";

type OrderStatus = "All" | "To Pay" | "To Ship" | "To Receive" | "Completed" | "Cancelled";

export default function MyPurchasesPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("All");
    const tabs: OrderStatus[] = ["All", "To Pay", "To Ship", "To Receive", "Completed", "Cancelled"];

    return (
        <div className="flex flex-col gap-6 font-sans">
            {/* Tabs */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm sticky top-[73px] z-40">
                <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] py-4 px-4 text-center transition-colors relative ${activeTab === tab
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground font-medium"
                                }`}
                        >
                            <span className="text-sm">{tab}</span>
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Orders */}
                <div className="p-4 bg-secondary/20">
                    <div className="relative group max-w-2xl">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Search className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            className="block w-full pl-11 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground"
                            placeholder="Search by Order ID, Shop or Product Name"
                            type="text"
                        />
                    </div>
                </div>
            </div>

            {/* Order Card 1 (In Transit) */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4 flex justify-between items-center border-b border-border bg-secondary/10">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">RJ MUSIC</span>
                        <Link href="/products" className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded flex items-center gap-1 hover:bg-primary/20 transition-colors">
                            <Store className="size-3" /> VISIT SHOP
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <Truck className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="size-24 sm:size-32 rounded-lg bg-secondary border border-border overflow-hidden shrink-0">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuYjPU0TZHHvLVmblSnM1WNQM7f1ln4qwPFXrM94SsvDSFJV_SCBPcHzYA3alDdM4B1phrjFTR53IFPmvUBlBmy6NyFm-43fpMRKcu4jZrVrIOXGfIoioMPDXobrneSZzGZDETeiuPkgFEyMg-3nGZDF4ZAaOH3H3BYPlwLIjWEQfXmNgaDaBCOTC5GOuicZIkBo12CFieHBbXHRd09sqxKKR8f8f_15T9_7aD7pOirmL8MyKAArUTuZxMpcUtbgVl-pcdvQKC0Ag"
                                alt="Gibson Les Paul"
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <p className="text-muted-foreground text-[10px] tracking-widest font-medium mb-1 uppercase">ORDER ID: 8274192BH</p>
                                <h3 className="text-lg font-bold mb-1 line-clamp-1">Gibson Les Paul Standard '60s Electric Guitar</h3>
                                <p className="text-muted-foreground text-sm">Variation: Iced Tea | Qty: 1</p>
                            </div>
                            <div className="flex items-end justify-between mt-4">
                                <div className="text-xs text-muted-foreground italic">Expected arrival: Nov 24, 2026</div>
                                <div className="text-primary text-xl font-bold">₱145,000.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-secondary/5 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground w-full md:w-auto text-center md:text-left">Refund within 7 days of receipt for manufacturing defects.</p>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors">
                            Contact Seller
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
                            Track Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Card 2 (Completed) */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
                <div className="px-6 py-4 flex justify-between items-center border-b border-border bg-secondary/10">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">RJ MUSIC</span>
                        <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-[10px] font-bold rounded uppercase tracking-tighter border border-border">Official Store</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="size-24 sm:size-32 rounded-lg bg-secondary border border-border overflow-hidden shrink-0">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnYS9N2m8N-dK_Jmoy4bFpmYk3bm_kwRH3sjxbQnBtQ7dRzPS0P9IRJh8-yEUkePkn6nTheRHRTxvcQEGICBCG1jH51YgRhttHFa0i1iyWZyOyU2g58tUd_eLkGRo1jljVOVkYDRVg6yhNqLap4Iji_rMgpNq4PfEcNU5ZiuChKqlgxVk1ZqE5OpxQfmr5dg6iSkNkaRJe6b_PBBtaKeYK-wIyYmxpSLn8o567aAiqBttA9AgSoqI0iZdvEVKxe8I2jS0WtE6R0GE"
                                alt="Yamaha P-125"
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <p className="text-muted-foreground text-[10px] tracking-widest font-medium mb-1 uppercase">ORDER ID: 9912034XY</p>
                                <h3 className="text-lg font-bold mb-1 line-clamp-1">Yamaha P-125 Digital Piano</h3>
                                <p className="text-muted-foreground text-sm">Variation: White | Qty: 1</p>
                            </div>
                            <div className="flex items-end justify-between mt-4">
                                <div className="text-xs text-green-500/80">Delivered on Oct 12, 2026</div>
                                <div className="text-primary text-xl font-bold">₱42,500.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-secondary/5 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-green-500/80 w-full md:w-auto text-center md:text-left">Thank you for shopping! Rate the product to earn points.</p>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                            <RotateCcw className="size-4" /> Buy Again
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2 border border-primary text-primary hover:bg-primary/10 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Star className="size-4" /> Rate Product
                        </button>
                    </div>
                </div>
            </div>

            {/* Purchase Summary */}
            <div className="p-6 bg-card border border-border rounded-xl">
                <h4 className="text-sm font-bold mb-4 uppercase tracking-wider border-b border-border pb-2">Purchase History Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase font-medium">Total Orders</p>
                        <p className="text-xl font-bold">12</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase font-medium">Total Spent</p>
                        <p className="text-xl font-bold text-primary">₱287,500.00</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase font-medium">Loyalty Status</p>
                        <p className="text-xl font-bold text-amber-400 flex items-center gap-2">
                            <Star className="size-5 fill-current" /> Platinum
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
