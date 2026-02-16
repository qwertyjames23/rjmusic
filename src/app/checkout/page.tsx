"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Package, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { Address } from "@/types";
import Image from "next/image";

type DbLikeError = {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (error && typeof error === "object") {
        const dbError = error as DbLikeError;
        const parts = [dbError.message, dbError.details, dbError.hint].filter(Boolean);
        if (parts.length > 0) return parts.join(" ");
        if (dbError.code) return `Database error (${dbError.code}).`;
    }
    return "Failed to place order. Please try again.";
}

function isMissingPlaceOrderRpc(error: DbLikeError | null): boolean {
    if (!error) return false;
    if (error.code === "PGRST202" || error.code === "42883") return true;
    const message = (error.message || "").toLowerCase();
    return message.includes("place_order") && (message.includes("not found") || message.includes("does not exist"));
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, selectedTotal, removeItems, selectedItems } = useCart();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "gcash" | "paymaya">("cod");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [idempotencyKey, setIdempotencyKey] = useState<string>("");

    // Initialize idempotency key once per checkout session
    useEffect(() => {
        setIdempotencyKey(crypto.randomUUID());
    }, []);

    // Filter items to show only selected ones
    const checkoutItems = items.filter(item => selectedItems.includes(item.id));

    const shippingFee = 100; // Fixed shipping fee
    // const tax = selectedTotal * 0.12; // 12% tax - Disabled temporarily per request
    const tax = 0;
    const total = selectedTotal + shippingFee + tax;

    // Redirect if no items selected
    useEffect(() => {
        if (!isLoading && !isSuccess && !isSubmitting && items.length > 0 && checkoutItems.length === 0) {
            router.push("/cart");
        }
    }, [items, checkoutItems, isLoading, router, isSuccess, isSubmitting]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push("/login?next=/checkout");
                    return;
                }

                const { data, error } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("is_default", { ascending: false });

                if (error) throw error;

                setAddresses(data || []);

                // Auto-select default address
                const defaultAddress = data?.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                } else if (data && data.length > 0) {
                    setSelectedAddressId(data[0].id);
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAddresses();
    }, [router]);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError("Please select a shipping address");
            return;
        }

        if (checkoutItems.length === 0) {
            setError("No items selected for checkout");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login?next=/checkout");
                return;
            }

            // Check for existing order with this idempotency key (prevent duplicates)
            const { data: existingOrder } = await supabase
                .from("orders")
                .select("id")
                .eq("idempotency_key", idempotencyKey)
                .maybeSingle();

            if (existingOrder) {
                setIsSuccess(true);
                removeItems(selectedItems);
                router.push(`/order-confirmation/${existingOrder.id}`);
                return;
            }

            // Get selected address
            const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
            if (!selectedAddress) {
                throw new Error("Selected address not found");
            }

            // Prepare Order Data
            const orderData = {
                user_id: user.id,
                order_number: "", // Trigger handles this
                shipping_name: selectedAddress.name,
                shipping_phone: selectedAddress.phone,
                shipping_address_line1: selectedAddress.address_line1,
                shipping_address_line2: selectedAddress.address_line2,
                shipping_city: selectedAddress.city,
                shipping_state: selectedAddress.state,
                shipping_postal_code: selectedAddress.postal_code,
                shipping_country: selectedAddress.country,
                subtotal: selectedTotal,
                shipping_fee: shippingFee,
                tax: tax,
                total: total,
                status: "Pending",
                payment_method: paymentMethod,
                payment_status: "pending",
                notes: notes || null,
                idempotency_key: idempotencyKey,
            };

            // Prepare Items Data
            const itemsData = checkoutItems.map(item => ({
                product_id: item.id,
                product_name: item.name,
                product_image: item.images[0] || null,
                product_price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            }));

            // Handle PayMongo Payments (GCash / Card)
            if (paymentMethod !== 'cod') {
                try {
                    // 1. Create the Pending Order First
                    const { data: createdOrder, error: orderInsertError } = await supabase
                        .from("orders")
                        .insert(orderData)
                        .select("id")
                        .single();

                    if (orderInsertError) {
                        // Handle duplicate idempotency_key (race condition)
                        if (orderInsertError.code === '23505') {
                            const { data: dup } = await supabase.from("orders").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
                            if (dup) { setIsSuccess(true); removeItems(selectedItems); router.push(`/order-confirmation/${dup.id}`); return; }
                        }
                        throw orderInsertError;
                    }
                    
                    const orderId = createdOrder.id;

                    const itemsWithOrderId = itemsData.map(item => ({ ...item, order_id: orderId }));
                    const { error: itemsInsertError } = await supabase
                        .from("order_items")
                        .insert(itemsWithOrderId);

                    if (itemsInsertError) {
                        await supabase.from("orders").delete().eq("id", orderId); // Rollback
                        throw itemsInsertError;
                    }

                    // 2. Call PayMongo Checkout API
                    const response = await fetch('/api/paymongo/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: total,
                            description: `Order #${orderId}`,
                            paymentMethod
                        })
                    });

                    const paymentData = await response.json();

                    if (!response.ok) throw new Error(paymentData.error || 'Payment initialization failed');

                    // 3. Redirect to PayMongo
                    window.location.href = paymentData.checkoutUrl;
                    return;

                } catch (err: unknown) {
                    console.error('Payment Error:', err);
                    setError(err instanceof Error ? err.message : "Payment processing failed");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Call RPC function to place order (preferred path) for COD
            const { data: order, error: rpcError } = await supabase.rpc('place_order', {
                order_data: orderData,
                items_data: itemsData
            });

            if (rpcError) {
                if (isMissingPlaceOrderRpc(rpcError)) {
                    // Fallback path if RPC is not deployed in current DB.
                    const { data: createdOrder, error: orderInsertError } = await supabase
                        .from("orders")
                        .insert(orderData)
                        .select("id")
                        .single();

                    if (orderInsertError) {
                        // Handle duplicate idempotency_key (race condition)
                        if (orderInsertError.code === '23505') {
                            const { data: dup } = await supabase.from("orders").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
                            if (dup) { setIsSuccess(true); removeItems(selectedItems); router.push(`/order-confirmation/${dup.id}`); return; }
                        }
                        throw orderInsertError;
                    }

                    const orderId = createdOrder?.id as string | undefined;
                    if (!orderId) throw new Error("Order was created but no order id was returned.");

                    const itemsWithOrderId = itemsData.map(item => ({ ...item, order_id: orderId }));
                    const { error: itemsInsertError } = await supabase
                        .from("order_items")
                        .insert(itemsWithOrderId);

                    if (itemsInsertError) {
                        // Best-effort rollback to avoid orphaned orders on partial failure.
                        await supabase.from("orders").delete().eq("id", orderId);
                        throw itemsInsertError;
                    }

                    setIsSuccess(true);
                    removeItems(selectedItems);
                    router.push(`/order-confirmation/${orderId}`);
                    return;
                }

                if (rpcError.message.includes("Insufficient stock")) {
                    throw new Error("One or more items in your cart are out of stock. Please check your cart.");
                }
                throw rpcError;
            }

            setIsSuccess(true);
            removeItems(selectedItems);

            const newOrderId = (order as { id?: string } | null)?.id;
            if (!newOrderId) {
                throw new Error("Order placed but no order id was returned.");
            }
            router.push(`/order-confirmation/${newOrderId}`);
        } catch (error: unknown) {
            console.error("Error placing order:", error);
            setError(getErrorMessage(error));
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Package className="size-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
                <button
                    onClick={() => router.push("/products")}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="size-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Shipping Address</h2>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No addresses found</p>
                                    <button
                                        onClick={() => router.push("/profile/addresses")}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-foreground">{address.name}</p>
                                                    {address.is_default && (
                                                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{address.phone}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {address.address_line1}
                                                    {address.address_line2 && `, ${address.address_line2}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {address.city}, {address.state} {address.postal_code}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="size-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Order Items ({checkoutItems.length})</h2>
                            </div>

                            <div className="space-y-4">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                        <div className="relative size-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                            <Image
                                                src={item.images[0] || "/placeholder.png"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-1">{item.category}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="size-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">Cash on Delivery</p>
                                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "gcash" ? "border-primary bg-primary/5" : "border-border"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="gcash"
                                        checked={paymentMethod === "gcash"}
                                        onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">GCash / PayMaya</p>
                                        <p className="text-sm text-muted-foreground">Secure e-wallet payment</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">Credit / Debit Card</p>
                                        <p className="text-sm text-muted-foreground">Visa, Mastercard via PayMongo</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4">Order Notes (Optional)</h2>

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions for your order?"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

                            {/* Totals */}
                            <div className="space-y-2 pt-4 border-t border-border">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">{formatPrice(selectedTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-foreground">{formatPrice(shippingFee)}</span>
                                </div>
                                {/* Tax Removed as requested */}
                                {/* <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (12%)</span>
                                    <span className="text-foreground">{formatPrice(tax)}</span>
                                </div> */}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                                    <span className="text-foreground">Total</span>
                                    <span className="text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex gap-2 items-start">
                                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting || !selectedAddressId || checkoutItems.length === 0}
                                className="w-full mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        {paymentMethod === 'cod' ? 'Placing Order...' : 'Redirecting to Payment...'}
                                    </>
                                ) : (
                                    <>
                                        {paymentMethod === 'cod' ? 'Place Order' : `Pay with ${paymentMethod === 'gcash' ? 'GCash' : 'Card'}`}
                                        <ChevronRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
