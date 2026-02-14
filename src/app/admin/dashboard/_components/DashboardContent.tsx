"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, Package, Bell, BarChart3 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { OrderRow } from "../../orders/_components/OrderRow";
import Link from "next/link";
import { RevenueChart } from "./RevenueChart";

interface DashboardContentProps {
    initialStats: {
        revenue: number;
        orders: number;
        products: number;
    };
    initialRecentOrders: Array<{
        id: string;
        order_number?: string;
        shipping_name?: string;
        shipping_phone?: string;
        total_amount?: number;
        total?: number;
        status: string;
        created_at: string;
    }>;
    initialChartData: { name: string; total: number }[];
}
type RecentOrder = DashboardContentProps["initialRecentOrders"][number];

export default function DashboardContent({ initialStats, initialRecentOrders, initialChartData }: DashboardContentProps) {
    const [stats, setStats] = useState(initialStats);
    const [recentOrders, setRecentOrders] = useState(initialRecentOrders);
    const [chartData, setChartData] = useState(initialChartData);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const [showNotification, setShowNotification] = useState(false);
    const supabase = createClient();

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        // Subscribe to new orders
        const channel = supabase
            .channel('dashboard-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('New order received:', payload);
                    const rawOrder = payload.new as Partial<RecentOrder> & { id?: string };
                    const newOrder: RecentOrder = {
                        id: rawOrder.id || crypto.randomUUID(),
                        order_number: rawOrder.order_number,
                        shipping_name: rawOrder.shipping_name,
                        shipping_phone: rawOrder.shipping_phone,
                        total_amount: Number(rawOrder.total_amount || 0),
                        total: Number(rawOrder.total || 0),
                        status: rawOrder.status || "Pending",
                        created_at: rawOrder.created_at || new Date().toISOString(),
                    };
                    const newOrderTotal = Number(newOrder.total || newOrder.total_amount || 0);

                    // Update stats
                    setStats((prev) => ({
                        ...prev,
                        orders: prev.orders + 1,
                        revenue: prev.revenue + newOrderTotal
                    }));

                    // Add to recent orders list
                    setRecentOrders((prev) => [newOrder, ...prev].slice(0, 5));

                    // Update Chart Data (Simple approximation: add to today)
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                    setChartData(prev => prev.map(item =>
                        item.name === today
                            ? { ...item, total: item.total + newOrderTotal }
                            : item
                    ));

                    // Track new order for highlighting
                    setNewOrderIds((prev) => new Set([...prev, newOrder.id]));

                    // Show notification
                    setShowNotification(true);

                    // Play notification sound
                    try {
                        const audio = new Audio('/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => { });
                    } catch { }

                    // Auto-hide notification
                    setTimeout(() => setShowNotification(false), 5000);

                    // Remove highlight
                    setTimeout(() => {
                        setNewOrderIds((prev) => {
                            const updated = new Set(prev);
                            updated.delete(newOrder.id);
                            return updated;
                        });
                    }, 10000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div className="flex flex-col gap-8">
            {/* New Order Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold">New Order Received!</p>
                            <p className="text-sm text-white/80">Dashboard updated automatically</p>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Revenue */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-[#111827] rounded-lg border border-gray-700">
                            <span className="text-green-500 font-bold text-lg">₱</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +15%
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {formatPrice(stats.revenue)}
                    </p>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                </div>

                {/* Total Orders */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-[#111827] rounded-lg border border-gray-700">
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +5%
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Orders</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{stats.orders}</p>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                </div>

                {/* Products in Stock */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-[#111827] rounded-lg border border-gray-700">
                            <Package className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Products</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{stats.products}</p>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-4 bg-[#1f2937] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Revenue Overview
                        </h3>
                    </div>
                    <RevenueChart data={chartData} />
                </div>

                {/* Placeholder for future detailed stats or another chart */}
                <div className="lg:col-span-3 bg-[#1f2937] border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Detailed Analytics</h3>
                    <p className="text-gray-400 text-sm mb-6">More insights coming soon.</p>
                    <div className="relative w-48 h-48 rounded-full border-4 border-gray-700 flex items-center justify-center">
                        <div className="text-2xl font-bold text-white">{stats.orders}</div>
                        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full" style={{ transform: 'rotate(45deg)' }}></div>
                    </div>
                    <p className="mt-4 text-sm text-blue-400 font-bold">Total Orders Processed</p>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                    <Link href="/admin/orders" className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
                        View All
                    </Link>
                </div>

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
                            <tbody className="divide-y divide-gray-800">

                                {(!recentOrders || recentOrders.length === 0) ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No orders found.</td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            isNew={newOrderIds.has(order.id)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
