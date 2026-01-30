"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

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
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                Your Cart
                <span className="text-lg font-normal text-muted-foreground">
                    ({cartCount} items)
                </span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
                        >
                            {/* Image */}
                            <div className="w-full sm:w-32 aspect-square rounded-lg bg-secondary/20 overflow-hidden shrink-0">
                                <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between gap-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg leading-tight">
                                            <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.brand} • {item.category}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="size-8 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="size-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                        {item.quantity > 1 && (
                                            <div className="text-xs text-muted-foreground">
                                                {formatPrice(item.price)} each
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-xl border border-border bg-card p-6 space-y-6">
                        <h2 className="font-bold text-xl">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="text-foreground">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-500 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Taxes (Included)</span>
                                <span className="text-foreground">{formatPrice(cartTotal * 0.12)}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-end">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-primary">{formatPrice(cartTotal)}</span>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
                        >
                            Proceed to Checkout
                            <ArrowRight className="size-4" />
                        </Link>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShoppingBag className="size-3" />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
