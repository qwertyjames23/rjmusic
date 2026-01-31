"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Loader2, MapPin, Truck, ShoppingBag, ArrowRight, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Address State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(mockPaymentMethods[0]);

    // Dynamic Shipping Logic
    const isBalingasag = selectedAddress?.city?.toLowerCase().includes("balingasag") || selectedAddress?.address?.toLowerCase().includes("balingasag");
    const shippingFee = isBalingasag ? 0 : 150;
    const total = cartTotal + shippingFee;

    const handleSubmit = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearCart();
        router.push("/checkout/success");
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="size-24 rounded-full bg-secondary mx-auto flex items-center justify-center mb-6">
                    <ShoppingBag className="size-10 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8 text-lg">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-bold text-primary-foreground transition-all hover:bg-primary/90">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 pb-32">
            <div className="max-w-6xl mx-auto">
                {/* Progress Nav */}
                <nav aria-label="Progress" className="mb-10">
                    <ol className="flex items-center space-x-4" role="list">
                        <li className="flex items-center">
                            <Link className="group flex items-center" href="/cart">
                                <span className="flex items-center justify-center size-8 rounded-full border-2 border-primary bg-primary text-white">
                                    <Check className="size-4" />
                                </span>
                                <span className="ml-3 text-sm font-medium text-primary hidden sm:block">Cart</span>
                            </Link>
                        </li>
                        <li className="flex items-center">
                            <span className="mx-3 h-0.5 w-6 bg-primary"></span>
                            <a className="group flex items-center" href="#">
                                <span className="flex items-center justify-center size-8 rounded-full border-2 border-primary bg-primary text-white">
                                    <Check className="size-4" />
                                </span>
                                <span className="ml-3 text-sm font-medium text-primary hidden sm:block">Shipping</span>
                            </a>
                        </li>
                        <li className="flex items-center">
                            <span className="mx-3 h-0.5 w-6 bg-secondary"></span>
                            <a aria-current="step" className="group flex items-center text-primary" href="#">
                                <span className="flex items-center justify-center size-8 rounded-full border-2 border-primary bg-primary text-white shadow-[0_0_10px_rgba(19,109,236,0.4)]">
                                    <span className="text-sm font-bold">3</span>
                                </span>
                                <span className="ml-3 text-sm font-bold text-primary">Payment</span>
                            </a>
                        </li>
                    </ol>
                </nav>

                <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Delivery Address */}
                        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="mt-1 text-primary">
                                        <MapPin className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2">Delivery Address</h3>
                                        {selectedAddress ? (
                                            <div className="text-muted-foreground text-sm leading-relaxed">
                                                <p className="font-medium text-foreground mb-1">
                                                    {selectedAddress.name} <span className="text-muted-foreground font-normal">| {selectedAddress.phone}</span>
                                                    <span className="ml-2 px-1.5 py-0.5 bg-secondary text-primary-foreground text-[10px] font-bold rounded uppercase border border-border">{selectedAddress.label}</span>
                                                </p>
                                                <p>{selectedAddress.address}</p>
                                                <p>{selectedAddress.city}, {selectedAddress.region} {selectedAddress.postal}</p>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground text-sm">No address selected</div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                        </section>

                        {/* Order Items */}
                        <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                                <ShoppingBag className="size-5 text-muted-foreground" />
                                <h3 className="font-bold">Order Items</h3>
                            </div>
                            <div className="divide-y divide-border">
                                {items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                                        <div className="size-20 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary/50 relative">
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold">{item.name}</h4>
                                            <div className="text-xs text-muted-foreground mt-1">Brand: {item.brand}</div>
                                        </div>
                                        <div className="flex gap-8 items-center sm:justify-end w-full sm:w-auto justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.price)}
                                            </div>
                                            <div className="text-sm font-medium">x{item.quantity}</div>
                                            <div className="font-bold">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Delivery Method */}
                        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Truck className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{shippingFee === 0 ? "Local Delivery (Free)" : "Standard Delivery"}</h3>
                                        <p className="text-sm text-muted-foreground">Get by 3-5 Business Days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={cn("font-medium", shippingFee === 0 && "text-green-500")}>
                                        {shippingFee === 0 ? "Free" : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(shippingFee)}
                                    </span>
                                    <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase">Change</button>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        {selectedPayment && <selectedPayment.icon className="size-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{selectedPayment?.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedPayment?.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase"
                                >
                                    Change
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-28">
                            <h3 className="text-lg font-bold mb-6">Order Summary</h3>

                            <div className="mb-6">
                                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Discount Code</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground"
                                        placeholder="Enter Voucher"
                                        type="text"
                                    />
                                    <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">Apply</button>
                                </div>
                            </div>

                            <div className="space-y-3 pb-6 border-b border-border mb-6 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="font-medium text-foreground">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping Fee</span>
                                    <span className={cn("font-medium text-foreground", shippingFee === 0 && "text-green-500")}>
                                        {shippingFee === 0 ? "Free" : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(shippingFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax (Included)</span>
                                    <span className="font-medium text-foreground">₱0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-base font-bold">Total Payment</span>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-primary">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(total)}</span>
                                    <span className="text-xs text-muted-foreground">VAT included where applicable</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className={cn(
                                    "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(19,109,236,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4 group",
                                    isProcessing && "opacity-80 cursor-not-allowed"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="text-center text-xs text-muted-foreground">
                                By placing an order, you agree to our <Link href="#" className="underline hover:text-primary">Terms of Service</Link>.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
                            <h3 className="text-xl font-bold">Select Delivery Address</h3>
                            <button
                                onClick={() => setIsAddressModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-secondary p-1 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                            {mockAddresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => {
                                        setSelectedAddress(addr);
                                        setIsAddressModalOpen(false);
                                    }}
                                    className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-secondary/30 relative",
                                        selectedAddress?.id === addr.id ? "border-primary bg-primary/5" : "border-border"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{addr.name}</span>
                                            <span className="w-px h-3 bg-border"></span>
                                            <span className="text-xs text-muted-foreground">{addr.phone}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {addr.id === selectedAddress?.id && <span className="text-primary"><Check className="size-4" /></span>}
                                            <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground text-[10px] font-bold rounded uppercase border border-border">{addr.label}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/80">{addr.address}</p>
                                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.region}, {addr.postal}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-border bg-secondary/10 flex justify-end">
                            <button
                                onClick={() => router.push("/profile/addresses")}
                                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <Plus className="size-4" /> Manage Addresses
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Selection Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
                            <h3 className="text-xl font-bold">Select Payment Method</h3>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-secondary p-1 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {mockPaymentMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <div
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedPayment(method);
                                            setIsPaymentModalOpen(false);
                                        }}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-secondary/30 relative flex items-center gap-4",
                                            selectedPayment?.id === method.id ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className={cn("size-12 rounded-full flex items-center justify-center shrink-0", selectedPayment?.id === method.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground")}>
                                            <Icon className="size-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-sm">{method.name}</h4>
                                                {selectedPayment?.id === method.id && <span className="text-primary"><Check className="size-5" /></span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Mock Data 
const mockAddresses = [
    {
        id: 1,
        name: "Alexander Rivers",
        phone: "(+63) 912 345 6789",
        address: "128 Synth Avenue, Studio B",
        city: "Makati City",
        region: "Metro Manila",
        postal: "1200",
        isDefault: true,
        label: "Home"
    },
    {
        id: 2,
        name: "Alex Rivera",
        phone: "(+63) 998 765 4321",
        address: "Unit 404, The Sound Garden, 5th Ave",
        city: "Taguig City",
        region: "Metro Manila",
        postal: "1630",
        isDefault: false,
        label: "Work"
    },
    {
        id: 3,
        name: "Rj Adams",
        phone: "(+63) 917 888 7777",
        address: "Pob. 3, Balingasag",
        city: "Balingasag",
        region: "Misamis Oriental",
        postal: "9005",
        isDefault: false,
        label: "Vacation Home"
    }
];

const mockPaymentMethods = [
    {
        id: "cod",
        name: "Cash on Delivery",
        description: "Pay when you receive",
        icon: Truck
    },
    {
        id: "gcash",
        name: "GCash",
        description: "Pay via GCash E-Wallet",
        icon: Wallet
    },
    {
        id: "card",
        name: "Credit / Debit Card",
        description: "Secure payment via PayMongo",
        icon: CreditCard
    }
];
