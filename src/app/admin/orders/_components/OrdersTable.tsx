"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, ChevronUp, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

interface Order {
    id: string;
    order_number: string;
    shipping_name: string;
    total: number;
    status: string;
    created_at: string;
    order_items: any[];
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        const supabase = createClient();
        
        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", orderId);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialOrders.map((order) => (
                            <>
                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-primary">{order.order_number}</td>
                                    <td className="p-4 font-medium text-white">{order.shipping_name}</td>
                                    <td className="p-4 text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        ₱{order.total.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        <select
                                            disabled={updatingId === order.id}
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            className="bg-[#0a0d11] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {updatingId === order.id && <Loader2 className="size-4 animate-spin text-primary" />}
                                        
                                        <button 
                                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                            className="p-1 hover:bg-white/10 rounded text-gray-400"
                                        >
                                            {expandedId === order.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === order.id && (
                                    <tr className="bg-white/[0.02]">
                                        <td colSpan={6} className="p-4">
                                            <div className="bg-[#0a0d11] rounded-lg p-4 border border-white/5">
                                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                    <Package className="size-4 text-primary" />
                                                    Order Items
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.order_items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 bg-white/5 rounded overflow-hidden relative">
                                                                    {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                                                                </div>
                                                                <span className="text-gray-300">{item.product_name} <span className="text-gray-500">x{item.quantity}</span></span>
                                                            </div>
                                                            <span className="text-white">₱{item.subtotal.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}