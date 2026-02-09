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

    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    // Toggle single order selection
    const toggleOrderSelection = (orderId: string, isSelected: boolean) => {
        setSelectedOrderIds(prev => {
            const next = new Set(prev);
            if (isSelected) {
                next.add(orderId);
            } else {
                next.delete(orderId);
            }
            return next;
        });
    };

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.order_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (order.id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (order.shipping_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "All" || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Toggle select all (filtered)
    const toggleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        } else {
            setSelectedOrderIds(new Set());
        }
    };

    const isAllSelected = filteredOrders.length > 0 && selectedOrderIds.size === filteredOrders.length;

    // Bulk Update Handler
    const handleBulkUpdate = async (status: string) => {
        if (selectedOrderIds.size === 0) return;

        if (!window.confirm(`Are you sure you want to mark ${selectedOrderIds.size} orders as ${status}?`)) return;

        setIsBulkUpdating(true);
        try {
            const ids = Array.from(selectedOrderIds);
            const { error } = await supabase
                .from('orders')
                .update({ status: status })
                .in('id', ids);

            if (error) throw error;

            // Optimistic update
            setOrders(prev => prev.map(o => selectedOrderIds.has(o.id) ? { ...o, status } : o));
            setSelectedOrderIds(new Set()); // Clear selection

        } catch (error) {
            console.error("Bulk update failed:", error);
            alert("Failed to update orders.");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    // Bulk Delete Handler
    const handleBulkDelete = async () => {
        if (selectedOrderIds.size === 0) return;

        if (!window.confirm(`Are you sure you want to DELETE ${selectedOrderIds.size} orders? This is irreversible.`)) return;

        setIsBulkUpdating(true);
        try {
            const ids = Array.from(selectedOrderIds);

            // 1. Delete associated order items first (manual cascade)
            const { error: itemsError } = await supabase
                .from('order_items')
                .delete()
                .in('order_id', ids);

            if (itemsError) {
                console.warn("Error deleting order items (might be optional):", itemsError);
                // Continue to try deleting orders anyway
            }

            // 2. Delete orders
            const { error, count } = await supabase
                .from('orders')
                .delete({ count: 'exact' })
                .in('id', ids);

            if (error) {
                console.error("Supabase Delete Error:", error);
                throw new Error(error.message);
            }

            console.log("Delete result:", { count, error });

            if (count === 0 || count === null) {
                // If count is null, it might mean we didn't ask for count, but we did ({ count: 'exact' })
                // Or RLS silently blocked it (which returns count 0, not error)
                throw new Error("No rows deleted. This usually means a permission issue (RLS Policy). Ensure you have run the 'Admin Delete Orders' policy SQL.");
            }

            // Optimistic update
            setOrders(prev => prev.filter(o => !selectedOrderIds.has(o.id)));
            setSelectedOrderIds(new Set());

            alert(`Successfully deleted ${count} orders.`);

        } catch (error: any) {
            console.error("Bulk delete failed FULL OBJECT:", error);
            alert(`Failed to delete orders: ${error.message || "Unknown error (check console)"}`);
            // If it was a permissions error, the UI might be out of sync if we didn't refresh, 
            // but here we didn't perform the optimistic update if we threw early.
            // If we threw AFTER logic (count===0), we haven't updated UI yet. Good.
        } finally {
            setIsBulkUpdating(false);
        }
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

            {/* Toolbar (Search & Filter) */}
            <div className="flex items-center gap-4 bg-[#1f2937] p-2 rounded-xl border border-gray-800 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, Customer Name..."
                        className="w-full bg-[#111827] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#111827] border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none cursor-pointer hover:border-gray-600"
                    aria-label="Filter by status"
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedOrderIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1c222b] border border-gray-700 rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
                        <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            {selectedOrderIds.size}
                        </div>
                        <span className="text-sm font-medium text-white">Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={isBulkUpdating}
                            onClick={() => handleBulkUpdate('Processing')}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-bold rounded-lg border border-blue-500/20 transition-colors"
                        >
                            Mark Processing
                        </button>
                        <button
                            disabled={isBulkUpdating}
                            onClick={() => handleBulkUpdate('Shipped')}
                            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-xs font-bold rounded-lg border border-purple-500/20 transition-colors"
                        >
                            Mark Shipped
                        </button>
                        <button
                            disabled={isBulkUpdating}
                            onClick={handleBulkDelete}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold rounded-lg border border-red-500/20 transition-colors"
                        >
                            Delete
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedOrderIds(new Set())}
                        className="ml-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <span className="sr-only">Cancel</span>
                        ✕
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className={`bg-[#1f2937] border border-gray-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 ${selectedOrderIds.size > 0 ? 'border-blue-500/30' : ''} transition-colors duration-300`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111827]/80 border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400 font-bold backdrop-blur-sm">
                                <th className="px-6 py-5 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                        className="size-4 rounded border-gray-700 bg-[#111827] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer accent-blue-600"
                                    />
                                </th>
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1f2937]/50 divide-y divide-gray-800/50">
                            {!filteredOrders || filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="size-8 text-gray-600" />
                                            <p>No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={{
                                            ...order,
                                            total_amount: order.total_amount || order.total
                                        }}
                                        isNew={newOrderIds.has(order.id)}
                                        isSelected={selectedOrderIds.has(order.id)}
                                        onSelect={(checked) => toggleOrderSelection(order.id, checked)}
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
