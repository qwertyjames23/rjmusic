"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, MapPin, FileText, CreditCard, Package, Loader2, Printer, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

interface OrderItem {
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderDetails {
    id: string;
    order_number: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    status: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    shipping_fee: number;
    tax: number;
    total: number;
    created_at: string;
    notes?: string;
}

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchDetails = async () => {
            if (!orderId) return;
            setLoading(true);
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (orderError) throw orderError;
                setOrder(orderData);

                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', orderId);

                if (itemsError) throw itemsError;
                setItems(itemsData || []);

            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && orderId) {
            fetchDetails();
            document.body.style.overflow = 'hidden';
        } else {
            setOrder(null);
            setItems([]);
            document.body.style.overflow = 'unset';
            setLoading(true);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, orderId, supabase]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Timeline Steps
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentStepIndex = order ? steps.indexOf(order.status) : -1;
    const isCancelled = order?.status === 'Cancelled';

    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order || !orderId) return;

        // Confirm before critical changes like cancelling
        if (newStatus === 'Cancelled' && !window.confirm('Are you sure you want to cancel this order? This action usually cannot be undone.')) {
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Optimistic update locally
            setOrder(prev => prev ? ({ ...prev, status: newStatus }) : null);

            // Optionally, we could show a toast here via a context, but basic alert for now if needed or silent success
            // Realtime subscription in parent will update the list/table, but we updated local modal state too.

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!order || !orderId) return;

        if (!window.confirm('Are you ABSOLUTELY SURE you want to delete this order permanently? This action CANNOT be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            // Delete order items first (if cascade is not set up, but usually it is)
            // Assuming ON DELETE CASCADE is set on foreign keys in DB.
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            // Close modal after successful deletion
            onClose();
            // Local state update not needed as parent subscription will remove it from list

        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete order. Please try again.");
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0">
            <div className="bg-[#0f141a] w-full max-w-5xl max-h-[95vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 print:w-full print:max-w-none print:h-full print:rounded-none print:border-none print:shadow-none print:bg-white print:text-black">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c222b] print:bg-white print:border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg print:hidden">
                            <FileText className="size-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white print:text-black">Order Details</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400 print:text-gray-600">
                                <span className="font-mono">#{order?.order_number || orderId?.slice(0, 8)}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                <span>{order && formatDate(order.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 print:hidden">

                        {/* Status Dropdown */}
                        {order && (
                            <div className="relative">
                                <select
                                    disabled={updating || isDeleting}
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    className="appearance-none bg-[#1f2937] border border-gray-700 hover:border-gray-500 text-white text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    {updating ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePrint}
                            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Print Invoice"
                        >
                            <Printer className="size-5" />
                        </button>

                        {/* Delete Button (Only for Cancelled or Delivered) */}
                        {order && (order.status === 'Cancelled' || order.status === 'Delivered') && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2.5 text-red-500 hover:text-white hover:bg-red-500/20 bg-red-500/10 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Order Permanently"
                            >
                                {isDeleting ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                )}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="size-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 print:overflow-visible">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="size-10 animate-spin text-primary" />
                            <p className="text-gray-400">Loading details...</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-8">

                            {/* Visual Timeline */}
                            {!isCancelled && (
                                <div className="w-full py-4 px-2 print:hidden">
                                    <div className="flex items-center justify-between relative px-4">
                                        {/* Connecting Line - Removed negative Z-Index so it sits on top of bg */}
                                        <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-gray-800 rounded-full"></div>
                                        <div
                                            className="absolute left-0 top-4 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-primary rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                                        ></div>

                                        {steps.map((step, index) => {
                                            const isCompleted = index <= currentStepIndex;

                                            return (
                                                <div key={step} className="flex flex-col items-center gap-2 group cursor-default relative">
                                                    <div className={`size-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${isCompleted
                                                        ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110'
                                                        : 'bg-[#0f141a] border-[#0f141a] ring-2 ring-gray-800 text-gray-600'
                                                        }`}>
                                                        {isCompleted ? <Check className="size-3.5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                                                    </div>
                                                    <span className={`text-xs font-bold transition-colors duration-300 ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                                                        {step}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                                    <AlertCircle className="size-5" />
                                    <div>
                                        <h4 className="font-bold">Order Cancelled</h4>
                                        <p className="text-sm opacity-80">This order has been cancelled and will not be processed.</p>
                                    </div>
                                </div>
                            )}

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-8">

                                {/* Left Column: Info */}
                                <div className="lg:col-span-1 space-y-6">
                                    {/* Customer & Address */}
                                    <div className="bg-[#1c222b] p-6 rounded-2xl border border-white/5 print:bg-white print:border-gray-200">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                            <MapPin className="size-4" /> Shipping Details
                                        </h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="size-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg shadow-inner print:hidden">
                                                {order.shipping_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg leading-tight print:text-black">{order.shipping_name}</p>
                                                <p className="text-blue-400 text-sm print:text-black">{order.shipping_phone}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-gray-300 text-sm leading-relaxed print:text-black">
                                            <p>{order.shipping_address_line1}</p>
                                            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                                            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                                            <p className="font-medium text-gray-500 uppercase mt-2">{order.shipping_country}</p>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-[#1c222b] p-6 rounded-2xl border border-white/5 print:bg-white print:border-gray-200">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                            <CreditCard className="size-4" /> Payment Info
                                        </h3>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                            <span className="text-gray-400 print:text-gray-600">Method</span>
                                            <span className="font-medium text-white uppercase print:text-black">{order.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                            <span className="text-gray-400 print:text-gray-600">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400 print:text-black print:bg-transparent'
                                                }`}>
                                                {order.payment_status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Notes */}
                                    {order.notes && (
                                        <div className="bg-[#1c222b] p-6 rounded-2xl border border-white/5 print:bg-white print:border-gray-200">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                <FileText className="size-4" /> Order Notes
                                            </h3>
                                            <p className="text-gray-300 italic text-sm bg-black/20 p-3 rounded-lg print:text-black print:bg-transparent print:p-0 print:border print:border-gray-200 print:not-italic">
                                                &ldquo;{order.notes}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Items & Summary */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    {/* Items List */}
                                    <div className="bg-[#1c222b] rounded-2xl border border-white/5 overflow-hidden print:bg-white print:border-gray-200">
                                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center print:bg-gray-100 print:border-gray-300">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider print:text-black">
                                                <Package className="size-4" /> Items ({items.length})
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-white/5 print:divide-gray-200">
                                            {items.map((item) => (
                                                <div key={item.id} className="p-4 flex gap-4 hover:bg-white/5 transition-colors print:hover:bg-transparent">
                                                    <div className="size-16 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 relative print:border-gray-300">
                                                        {item.product_image ? (
                                                            <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                <Package className="size-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <div>
                                                            <h4 className="text-white font-bold text-sm line-clamp-2 mb-1 print:text-black">{item.product_name}</h4>
                                                            <p className="text-sm text-gray-400 print:text-gray-600">Unit Price: {formatPrice(item.price)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-400 mb-1 print:text-gray-600">Quantity: <span className="text-white font-bold print:text-black">{item.quantity}</span></p>
                                                            <p className="text-primary font-bold print:text-black">
                                                                {formatPrice(item.subtotal || (item.price * item.quantity))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="bg-[#1c222b] p-6 rounded-2xl border border-white/5 print:bg-white print:border-gray-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 print:text-gray-600">Subtotal</span>
                                                <span className="text-white font-medium print:text-black">{formatPrice(order.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 print:text-gray-600">Shipping Fee</span>
                                                <span className="text-white font-medium print:text-black">{formatPrice(order.shipping_fee)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 print:text-gray-600">Tax (12%)</span>
                                                <span className="text-white font-medium print:text-black">{formatPrice(order.tax)}</span>
                                            </div>
                                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 print:bg-gray-300 print:from-gray-300 print:to-gray-300" />
                                            <div className="flex justify-between items-end">
                                                <span className="text-lg font-bold text-white print:text-black">Total Amount</span>
                                                <span className="text-2xl font-bold text-primary print:text-black">{formatPrice(order.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">Order not found</div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#1c222b] flex justify-end gap-3 print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
