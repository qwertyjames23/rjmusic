"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Loader2, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        cardNumber: "",
        expiry: "",
        cvc: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear cart and redirect
        clearCart();
        router.push("/checkout/success");
    };

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
                <p className="text-muted-foreground mb-4">Add some items before checking out.</p>
                <Link href="/products" className="text-primary hover:underline">Go to Products</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                {/* Left Column: Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                        <p className="text-muted-foreground">Complete your order with secure payment.</p>
                    </div>

                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Contact */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                                Contact Information
                            </h2>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                                Shipping Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="123 Music St"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <input
                                        required
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="New York"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                                Payment Method
                            </h2>
                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="size-5 text-primary" />
                                    <span className="font-bold text-sm">Credit Card (Secure)</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Card Number</label>
                                <input
                                    required
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expiry</label>
                                    <input
                                        required
                                        type="text"
                                        name="expiry"
                                        value={formData.expiry}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CVC</label>
                                    <input
                                        required
                                        type="text"
                                        name="cvc"
                                        value={formData.cvc}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:pl-8">
                    <div className="sticky top-24 rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/40">
                        <div className="bg-secondary/30 p-6 border-b border-border">
                            <h2 className="text-lg font-bold">Order Summary</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="size-16 rounded-md bg-secondary/50 overflow-hidden shrink-0">
                                            <img src={item.images[0]} alt={item.name} className="size-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                                <span className="text-sm font-medium">
                                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-green-500 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cartTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing}
                                className={cn(
                                    "w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                                    isProcessing
                                        ? "bg-secondary text-muted-foreground cursor-wait"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Processing Order...
                                    </>
                                ) : (
                                    <>
                                        <Check className="size-5" />
                                        Pay {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cartTotal)}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-70">
                                <Truck className="size-3" />
                                <span>Free shipping on this order</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
