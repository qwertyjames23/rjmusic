"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login?next=/cart');
            } else {
                setIsAuthLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    // Select all items by default when cart loads
    useEffect(() => {
        if (items.length > 0 && selectedItems.length === 0) {
            setSelectedItems(items.map(item => item.id));
        }
    }, [items, selectedItems.length]);

    // Checkbox handlers
    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.id));
        }
    };

    const toggleSelectItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;
        if (confirm(`Remove ${selectedItems.length} item(s) from cart?`)) {
            selectedItems.forEach(id => removeFromCart(id));
            setSelectedItems([]);
        }
    };

    // Calculate selected items total
    const selectedTotal = items
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-[#282f39] border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading cart...</p>
                </div>
            </div>
        );
    }

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
                    ({items.length} items)
                </span>
            </h1>

            <div className="mb-8">
                {/* Header (Optional, for table-like feel) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 mb-4 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-1 flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={selectedItems.length === items.length && items.length > 0}
                            onChange={toggleSelectAll}
                            className="size-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                            aria-label="Select all items"
                        />
                    </div>
                    <div className="col-span-5">Product</div>
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
                                {/* Checkbox */}
                                <div className="hidden md:flex col-span-1 items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                        className="size-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                        aria-label={`Select ${item.name}`}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="col-span-5 w-full flex items-start gap-4">
                                    {/* Mobile checkbox */}
                                    <div className="md:hidden flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => toggleSelectItem(item.id)}
                                            className="size-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                            aria-label={`Select ${item.name}`}
                                        />
                                    </div>
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

                    {/* Left Side: Select All & Delete */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="size-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground">
                                Select All ({selectedItems.length}/{items.length})
                            </span>
                        </label>

                        {selectedItems.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="size-4" />
                                <span className="hidden sm:inline">Delete ({selectedItems.length})</span>
                                <span className="sm:hidden">Delete</span>
                            </button>
                        )}
                    </div>

                    {/* Right Side: Total & Checkout */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Total ({selectedItems.length} items):</span>
                                <span className="font-bold text-2xl text-primary">{formatPrice(selectedTotal)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Taxes included</span>
                        </div>

                        <Link
                            href="/checkout"
                            className={`h-12 px-8 md:px-12 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${selectedItems.length === 0
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
                                }`}
                            onClick={(e) => {
                                if (selectedItems.length === 0) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            Check Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
