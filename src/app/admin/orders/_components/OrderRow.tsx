"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Order {
    id: string;
    order_number?: string;
    shipping_name?: string;
    shipping_phone?: string;
    total_amount?: number;
    total?: number;
    status: string;
    created_at: string;
}

interface OrderRowProps {
    order: Order;
    isNew?: boolean;
}

export function OrderRow({ order, isNew = false }: OrderRowProps) {
    const [status, setStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', order.id);

            if (error) throw error;
            setStatus(newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const amount: number = Number(order.total_amount || order.total || 0);

    return (
        <tr className={`group hover:bg-[#374151]/30 transition-colors border-b border-gray-800/50 ${isNew ? 'bg-green-500/10 animate-pulse' : ''}`}>
            <td className="px-6 py-4 text-sm font-bold text-white max-w-[120px] truncate" title={order.id}>
                #{order.id.slice(0, 8)}...
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {order.shipping_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{order.shipping_name || 'Unknown Customer'}</span>
                        <span className="text-xs text-gray-500">{order.shipping_phone || 'No phone'}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
                {new Date(order.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-sm font-bold text-white">
                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
            </td>
            <td className="px-6 py-4">
                <div className="relative group/status inline-block">
                    <button className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${status === 'Completed' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                        status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-green-400' :
                            status === 'Processing' ? 'bg-blue-400' :
                                'bg-yellow-400'
                            }`}></div>
                        {loading ? 'Updating...' : status}
                    </button>

                    {/* Dropdown on Hover */}
                    <div className="absolute top-full left-0 mt-2 w-32 bg-[#1f2937] border border-gray-700 rounded-lg shadow-xl overflow-hidden hidden group-hover/status:block z-50">
                        <button onClick={() => handleStatusChange('Pending')} className="w-full text-left px-4 py-2 text-xs text-yellow-400 hover:bg-gray-700">Pending</button>
                        <button onClick={() => handleStatusChange('Processing')} className="w-full text-left px-4 py-2 text-xs text-blue-400 hover:bg-gray-700">Processing</button>
                        <button onClick={() => handleStatusChange('Completed')} className="w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-gray-700">Completed</button>
                        <button onClick={() => handleStatusChange('Cancelled')} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-gray-700">Cancelled</button>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                    aria-label="Order actions"
                    title="Order actions"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
