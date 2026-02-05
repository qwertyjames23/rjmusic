"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrderRow } from "./OrderRow";
import { Bell } from "lucide-react";

interface Order {
    id: string;
    order_number: string;
    user_id: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    subtotal: number;
    shipping_fee: number;
    tax: number;
    total: number;
    total_amount?: number; // Alias for total
    status: string;
    payment_method: string;
    payment_status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface OrdersTableProps {
    initialOrders: Order[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const [showNotification, setShowNotification] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to new orders
        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('New order received:', payload);
                    const newOrder = payload.new as Order;

                    // Add total_amount alias for compatibility
                    newOrder.total_amount = newOrder.total;

                    // Add to beginning of list
                    setOrders((prev) => [newOrder, ...prev]);

                    // Track new order for highlighting
                    setNewOrderIds((prev) => new Set([...prev, newOrder.id]));

                    // Show notification
                    setShowNotification(true);

                    // Play notification sound (optional)
                    try {
                        const audio = new Audio('/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => { }); // Ignore if no sound file
                    } catch { }

                    // Auto-hide notification after 5 seconds
                    setTimeout(() => setShowNotification(false), 5000);

                    // Remove highlight after 10 seconds
                    setTimeout(() => {
                        setNewOrderIds((prev) => {
                            const updated = new Set(prev);
                            updated.delete(newOrder.id);
                            return updated;
                        });
                    }, 10000);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Order updated:', payload);
                    const updatedOrder = payload.new as Order;
                    updatedOrder.total_amount = updatedOrder.total;

                    setOrders((prev) =>
                        prev.map((order) =>
                            order.id === updatedOrder.id ? updatedOrder : order
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <>
            {/* New Order Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold">New Order Received!</p>
                            <p className="text-sm text-white/80">A customer just placed an order</p>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="ml-4 text-white/60 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-[#1f2937] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111827]/50 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-bold">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1f2937]">
                            {!orders || orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={{
                                            ...order,
                                            total_amount: order.total_amount || order.total
                                        }}
                                        isNew={newOrderIds.has(order.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
