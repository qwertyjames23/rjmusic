"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, Package, MapPin, CreditCard, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Order, OrderItem } from "@/types";
import Image from "next/image";

export default function OrderConfirmationPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const supabase = createClient();

                // Fetch order
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("id", orderId)
                    .single();

                if (orderError) throw orderError;

                // Fetch order items
                const { data: itemsData, error: itemsError } = await supabase
                    .from("order_items")
                    .select("*")
                    .eq("order_id", orderId);

                if (itemsError) throw itemsError;

                setOrder(orderData);
                setOrderItems(itemsData || []);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Order not found</h1>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/10 mb-4">
                        <CheckCircle className="size-8 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your order. We&apos;ll send you a confirmation email shortly.
                    </p>
                </div>

                {/* Order Number */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                            <p className="text-2xl font-bold text-foreground">{order.order_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Shipping Address */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="size-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Shipping Address</h2>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">{order.shipping_name}</p>
                            <p>{order.shipping_phone}</p>
                            <p>{order.shipping_address_line1}</p>
                            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                            <p>{order.shipping_country}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="size-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">
                                {order.payment_method === 'cod' && 'Cash on Delivery'}
                                {order.payment_method === 'gcash' && 'GCash'}
                                {order.payment_method === 'card' && 'Credit/Debit Card'}
                            </p>
                            <p>Status: <span className="text-foreground capitalize">{order.payment_status}</span></p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {orderItems.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                <div className="relative size-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                    {item.product_image && (
                                        <Image
                                            src={item.product_image}
                                            alt={item.product_name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">{item.product_name}</h3>
                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                    <p className="text-sm font-semibold text-foreground mt-1">
                                        {formatPrice(item.product_price)} × {item.quantity} = {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-foreground">{formatPrice(order.shipping_fee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="text-foreground">{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span className="text-foreground">Total</span>
                            <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/profile/purchases")}
                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        View My Orders
                        <ChevronRight className="size-4" />
                    </button>
                    <button
                        onClick={() => router.push("/products")}
                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
