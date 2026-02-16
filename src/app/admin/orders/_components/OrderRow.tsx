"use client";

import { useState } from "react";
import { Eye, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Order {
    id: string;
    order_number?: string;
    shipping_name?: string;
    shipping_phone?: string;
    total_amount?: number;
    total?: number;
    status: string;
    payment_status: string;
    created_at: string;
}

interface OrderRowProps {
    order: Order;
    isNew?: boolean;
    isSelected?: boolean;
    onSelect?: (video: boolean) => void;
    onViewDetails?: () => void;
}

export function OrderRow({ order, isNew = false, isSelected = false, onSelect, onViewDetails }: OrderRowProps) {
    const [status, setStatus] = useState(order.status);
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const supabase = createClient();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
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

    const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPaymentStatus = e.target.value;
        if (newPaymentStatus === paymentStatus) return;
        setPaymentLoading(true);

        try {
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: newPaymentStatus })
                .eq('id', order.id);

            if (error) throw error;
            setPaymentStatus(newPaymentStatus);
            
            // Note: If the trigger we planned is active, the main order status 
            // will automatically change in the DB when set to 'paid'.
            // For immediate UI update, we can manually set it if we detect 'paid'.
            if (newPaymentStatus === 'paid' && status === 'Pending') {
                setStatus('Processing');
            }
        } catch (err) {
            console.error("Failed to update payment status", err);
            alert("Failed to update payment status");
        } finally {
            setPaymentLoading(false);
        }
    };

    const amount: number = Number(order.total_amount || order.total || 0);

    const getStatusColors = (statusVal: string) => {
        switch (statusVal) {
            case 'Completed':
            case 'Delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'Processing':
            case 'Shipped':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'Cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/20';
            default: // Pending or others
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
        }
    };

    const getPaymentStatusColors = (statusVal: string) => {
        switch (statusVal) {
            case 'paid':
                return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'failed':
            case 'refunded':
                return 'bg-red-500/20 text-red-400 border-red-500/20';
            default: // pending
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
        }
    };

    return (
        <tr className={`group hover:bg-[#252d38] transition-all duration-200 border-b border-gray-800/30 ${isNew ? 'bg-green-500/10 animate-pulse' : ''} ${isSelected ? 'bg-blue-500/5' : ''}`}>
            {/* Checkbox */}
            <td className="px-6 py-4 w-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect?.(e.target.checked)}
                    className="size-4 rounded border-gray-700 bg-[#111827] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#1f2937] transition-all cursor-pointer accent-blue-600"
                />
            </td>

            {/* Order ID */}
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-mono text-xs text-gray-400 tracking-wide">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</span>
                </div>
            </td>

            {/* Customer */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase shadow-inner">
                        {order.shipping_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{order.shipping_name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">{order.shipping_phone || ''}</span>
                    </div>
                </div>
            </td>

            {/* Date */}
            <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>

            {/* Amount (Right Aligned) */}
            <td className="px-6 py-4 text-right">
                <span className="text-sm font-bold text-white tabular-nums tracking-tight">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
                </span>
            </td>

            {/* Payment Status (Center with Select) */}
            <td className="px-6 py-4">
                <div className="flex justify-center">
                    <div className={`relative inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer hover:brightness-110 ${getPaymentStatusColors(paymentStatus)}`}>
                        {paymentLoading ? (
                            <span className="opacity-70">...</span>
                        ) : (
                            <>
                                <select
                                    value={paymentStatus}
                                    onChange={handlePaymentStatusChange}
                                    className="appearance-none bg-transparent border-none outline-none text-center cursor-pointer font-bold w-full pr-4 text-inherit"
                                >
                                    <option value="pending" className="bg-[#1f2937] text-yellow-400">P. Pending</option>
                                    <option value="paid" className="bg-[#1f2937] text-green-400">Paid</option>
                                    <option value="failed" className="bg-[#1f2937] text-red-400">Failed</option>
                                    <option value="refunded" className="bg-[#1f2937] text-gray-400">Refunded</option>
                                </select>
                                <ChevronDown className="size-3 absolute right-2 pointer-events-none opacity-70" />
                            </>
                        )}
                    </div>
                </div>
            </td>

            {/* Order Status (Center with Select) */}
            <td className="px-6 py-4">
                <div className="flex justify-center">
                    <div className={`relative inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer hover:brightness-110 ${getStatusColors(status)}`}>
                        {loading ? (
                            <span className="opacity-70">...</span>
                        ) : (
                            <>
                                <select
                                    value={status}
                                    onChange={handleStatusChange}
                                    className="appearance-none bg-transparent border-none outline-none text-center cursor-pointer font-bold w-full pr-4 text-inherit"
                                >
                                    <option value="Pending" className="bg-[#1f2937] text-yellow-400">O. Pending</option>
                                    <option value="Processing" className="bg-[#1f2937] text-blue-400">Processing</option>
                                    <option value="Shipped" className="bg-[#1f2937] text-purple-400">Shipped</option>
                                    <option value="Delivered" className="bg-[#1f2937] text-green-400">Delivered</option>
                                    <option value="Cancelled" className="bg-[#1f2937] text-red-400">Cancelled</option>
                                </select>
                                <ChevronDown className="size-3 absolute right-2 pointer-events-none opacity-70" />
                            </>
                        )}
                    </div>
                </div>
            </td>

            {/* Action (Right Aligned) */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={onViewDetails}
                    className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold group-hover:bg-white/5"
                    aria-label="View Order Details"
                >
                    <Eye className="size-3.5" />
                    Details
                </button>
            </td>
        </tr>
    );
}
