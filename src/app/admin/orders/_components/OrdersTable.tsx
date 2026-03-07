"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Package, Trash2 } from "lucide-react";
import Image from "next/image";

interface OrderItem {
    id: string;
    product_name: string;
    product_image?: string | null;
    quantity: number;
    subtotal: number;
}

interface Order {
    id: string;
    order_number: string;
    shipping_name: string;
    shipping_phone?: string | null;
    shipping_address_line1?: string | null;
    shipping_address_line2?: string | null;
    shipping_city?: string | null;
    shipping_state?: string | null;
    shipping_postal_code?: string | null;
    payment_method?: string | null;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
    order_items: OrderItem[];
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
    const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
    
    const showNotification = (message: string, isError = false) => {
        const div = document.createElement("div");
        div.className = `fixed top-4 right-4 ${isError ? "bg-red-500" : "bg-green-500"} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300`;
        div.textContent = isError ? `✕ ${message}` : `✓ ${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        
        try {
            const res = await fetch("/api/admin/orders/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderId, status: newStatus }),
            });
            const payload = await res.json();

            if (!res.ok) throw new Error(payload.error || "Failed to update status");
            showNotification(`Order status updated to ${newStatus}`);
            router.refresh();
        } catch (error: unknown) {
            console.error("Error updating status:", error);
            showNotification(error instanceof Error ? error.message : "Failed to update status", true);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
        setUpdatingPaymentId(orderId);
        
        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: newPaymentStatus })
                .eq('id', orderId);

            if (error) throw error;
            
            showNotification(`Payment status updated to ${newPaymentStatus}`);
            router.refresh();
        } catch (error: unknown) {
            console.error("Error updating payment status:", error);
            showNotification(error instanceof Error ? error.message : "Failed to update payment status", true);
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === initialOrders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialOrders.map(o => o.id)));
        }
    };

    const handleDelete = async (orderIds: string[]) => {
        if (orderIds.length === 0) return;

        const confirmMsg = orderIds.length === 1
            ? "Are you sure you want to delete this order?"
            : `Are you sure you want to delete ${orderIds.length} orders?`;

        if (!confirm(confirmMsg)) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/admin/orders/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_ids: orderIds }),
            });
            const payload = await res.json();

            if (!res.ok) throw new Error(payload.error || "Failed to delete");
            showNotification(`Deleted ${orderIds.length} order(s)`);
            setSelectedIds(new Set());
            router.refresh();
        } catch (error: unknown) {
            console.error("Error deleting orders:", error);
            showNotification(error instanceof Error ? error.message : "Failed to delete orders", true);
        } finally {
            setDeleting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'failed':
            case 'refunded': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-red-500/10 border-b border-red-500/20">
                    <span className="text-sm text-red-400 font-medium">
                        {selectedIds.size} order(s) selected
                    </span>
                    <button
                        onClick={() => handleDelete(Array.from(selectedIds))}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="size-3.5" />
                        {deleting ? "Deleting..." : "Delete Selected"}
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === initialOrders.length && initialOrders.length > 0}
                                    onChange={toggleSelectAll}
                                    className="size-4 rounded cursor-pointer accent-primary"
                                />
                            </th>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4 text-center">Payment</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialOrders.map((order) => (
                            <Fragment key={order.id}>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(order.id)}
                                            onChange={() => toggleSelect(order.id)}
                                            className="size-4 rounded cursor-pointer accent-primary"
                                        />
                                    </td>
                                    <td className="p-4 font-mono text-primary text-xs">{order.order_number || order.id.slice(0,8).toUpperCase()}</td>
                                    <td className="p-4 font-medium text-white">{order.shipping_name}</td>
                                    <td className="p-4 text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        ₱{order.total.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusColor(order.payment_status)} uppercase tracking-wider`}>
                                                {order.payment_status}
                                            </span>
                                            <select
                                                disabled={updatingPaymentId === order.id}
                                                value={order.payment_status}
                                                onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                                                className="bg-transparent border-none text-[10px] text-gray-500 focus:outline-none cursor-pointer hover:text-white transition-colors"
                                            >
                                                {PAYMENT_STATUSES.map((status) => (
                                                    <option key={status} value={status} className="bg-[#0f141a]">{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                                                {order.status}
                                            </span>
                                            <select
                                                disabled={updatingId === order.id}
                                                value={ORDER_STATUSES.find((s) => s.toLowerCase() === order.status.toLowerCase()) || "Pending"}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="bg-transparent border-none text-[10px] text-gray-500 focus:outline-none cursor-pointer hover:text-white transition-colors"
                                            >
                                                {ORDER_STATUSES.map((status) => (
                                                    <option key={status} value={status} className="bg-[#0f141a]">{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                            className="p-1 hover:bg-white/10 rounded text-gray-400 flex items-center gap-1 text-xs"
                                        >
                                            {expandedId === order.id ? <><ChevronUp className="size-4" /> Hide</> : <><ChevronDown className="size-4" /> Items</>}
                                        </button>
                                        <button
                                            onClick={() => handleDelete([order.id])}
                                            disabled={deleting}
                                            className="p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-colors"
                                            title="Delete order"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === order.id && (
                                    <tr className="bg-white/[0.02]">
                                        <td colSpan={8} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Customer Details */}
                                                <div className="bg-[#0a0d11] rounded-lg p-4 border border-white/5">
                                                    <h4 className="text-sm font-bold text-white mb-3">Customer Details</h4>
                                                    <div className="space-y-1.5 text-sm">
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-500 w-16 shrink-0">Name</span>
                                                            <span className="text-gray-200">{order.shipping_name || "—"}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-500 w-16 shrink-0">Phone</span>
                                                            <span className="text-gray-200">{order.shipping_phone || "—"}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-500 w-16 shrink-0">Address</span>
                                                            <span className="text-gray-200">
                                                                {[
                                                                    order.shipping_address_line1,
                                                                    order.shipping_address_line2,
                                                                    order.shipping_city,
                                                                    order.shipping_state,
                                                                    order.shipping_postal_code,
                                                                ].filter(Boolean).join(", ") || "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-500 w-16 shrink-0">Payment</span>
                                                            <span className="text-gray-200 uppercase">{order.payment_method || "—"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Order Items */}
                                                <div className="bg-[#0a0d11] rounded-lg p-4 border border-white/5">
                                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                        <Package className="size-4 text-primary" />
                                                        Order Items
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {order.order_items.map((item) => (
                                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 bg-white/5 rounded overflow-hidden relative">
                                                                        {item.product_image && (
                                                                            <Image
                                                                                src={item.product_image}
                                                                                alt={item.product_name}
                                                                                fill
                                                                                className="object-cover"
                                                                                sizes="32px"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-300">{item.product_name} <span className="text-gray-500">x{item.quantity}</span></span>
                                                                </div>
                                                                <span className="text-white">₱{item.subtotal.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
