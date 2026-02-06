"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrderRow } from "./OrderRow";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { Bell, Filter, Search } from "lucide-react";

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

    // Modal State
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                    const newOrder = payload.new as Order;
                    newOrder.total_amount = newOrder.total;
                    setOrders((prev) => [newOrder, ...prev]);
                    setNewOrderIds((prev) => new Set([...prev, newOrder.id]));
                    setShowNotification(true);
                    try {
                        const audio = new Audio('/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => { });
                    } catch { }

                    setTimeout(() => setShowNotification(false), 5000);
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

    const handleViewDetails = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDetailsOpen(true);
    };

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
            <div className="bg-[#1f2937] border border-gray-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111827]/80 border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400 font-bold backdrop-blur-sm">
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1f2937]/50 divide-y divide-gray-800/50">
                            {!orders || orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="size-8 text-gray-600" />
                                            <p>No orders found</p>
                                        </div>
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
                                        onViewDetails={() => handleViewDetails(order.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <OrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                orderId={selectedOrderId}
            />
        </>
    );
}
