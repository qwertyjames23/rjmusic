"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <div className="size-24 rounded-full bg-secondary/30 flex items-center justify-center mb-6 text-muted-foreground">
                    <ShoppingBag className="size-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Looks like you haven&apos;t added any gear to your setup yet.
                    Browse our collection to find your next sound.
                </p>
                <Link
                    href="/"
                    className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 pb-32">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                Your Cart
                <span className="text-lg font-normal text-muted-foreground">
                    ({cartCount} items)
                </span>
            </h1>

            <div className="mb-8">
                {/* Header (Optional, for table-like feel) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 mb-4 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Unit Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-1 text-center">Total Price</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                {/* Cart Items List */}
                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm hover:border-primary/20 transition-all"
                        >
                            <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                                {/* Product Info */}
                                <div className="col-span-6 w-full flex items-start gap-4">
                                    <div className="size-20 md:size-24 rounded-lg bg-secondary/20 overflow-hidden shrink-0 border border-border">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${item.id}`}
                                            className="font-bold text-base md:text-lg hover:text-primary transition-colors line-clamp-2"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground mt-1">{item.brand} • {item.category}</p>
                                    </div>
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-2 hidden md:flex items-center justify-center text-muted-foreground">
                                    {formatPrice(item.price)}
                                </div>

                                {/* Quantity Mobile & Desktop */}
                                <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-center w-full md:w-auto">
                                    <span className="md:hidden text-sm text-muted-foreground">Quantity:</span>
                                    <div className="flex items-center gap-2 bg-secondary/30 rounded-lg p-1 border border-border">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="size-8 flex items-center justify-center rounded hover:bg-background transition-colors disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="size-3.5" />
                                        </button>
                                        <input
                                            type="text"
                                            value={item.quantity}
                                            readOnly
                                            className="w-8 text-center bg-transparent text-sm font-medium focus:outline-none"
                                            aria-label="Quantity"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="size-8 flex items-center justify-center rounded hover:bg-background transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Total Price */}
                                <div className="col-span-12 md:col-span-1 flex items-center justify-between md:justify-center w-full md:w-auto">
                                    <span className="md:hidden text-sm text-muted-foreground">Total:</span>
                                    <span className="font-bold text-primary">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors flex items-center gap-2 md:gap-0"
                                        aria-label="Remove item"
                                    >
                                        <span className="md:hidden text-sm font-medium">Remove</span>
                                        <Trash2 className="size-4 md:size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shopee-style Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full z-40 bg-card border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-4 duration-300">
                <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Left Side (Optional: Select All, etc) */}
                    <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
                        <ShoppingBag className="size-4" />
                        <span>{items.length} items selected</span>
                    </div>

                    {/* Right Side: Total & Checkout */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Total ({cartCount} items):</span>
                                <span className="font-bold text-2xl text-primary">{formatPrice(cartTotal)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Taxes included</span>
                        </div>

                        <Link
                            href="/checkout"
                            className="h-12 px-8 md:px-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            Check Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
