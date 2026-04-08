import { createClient } from "@/utils/supabase/server";
import { BarChart3, TrendingUp, ShoppingCart, Users, ExternalLink, Package } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
    const supabase = await createClient();

    // Total revenue & orders
    const { data: orders } = await supabase
        .from("orders")
        .select("total, status, created_at, payment_method");

    const totalRevenue = (orders || [])
        .filter(o => o.status !== "Cancelled")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const totalOrders = (orders || []).length;
    const pendingOrders = (orders || []).filter(o => o.status === "Pending").length;
    const deliveredOrders = (orders || []).filter(o => o.status === "Delivered").length;

    // Payment method breakdown
    const codOrders = (orders || []).filter(o => o.payment_method?.toLowerCase() === "cod").length;
    const gcashOrders = (orders || []).filter(o => o.payment_method?.toLowerCase() === "gcash").length;

    // Messenger vs website orders
    const { data: messengerOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("notes", "Order via Facebook Messenger");
    const messengerCount = messengerOrders?.length || 0;
    const websiteCount = totalOrders - messengerCount;

    // Total customers
    const { count: customerCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

    // Top products
    const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal");

    const productMap: Record<string, { qty: number; revenue: number }> = {};
    (orderItems || []).forEach(item => {
        const name = item.product_name || "Unknown";
        if (!productMap[name]) productMap[name] = { qty: 0, revenue: 0 };
        productMap[name].qty += Number(item.quantity || 0);
        productMap[name].revenue += Number(item.subtotal || 0);
    });
    const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5);

    // Revenue by month (last 6 months)
    const monthlyMap: Record<string, number> = {};
    (orders || [])
        .filter(o => o.status !== "Cancelled")
        .forEach(o => {
            const month = new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
            monthlyMap[month] = (monthlyMap[month] || 0) + Number(o.total || 0);
        });
    const monthlyRevenue = Object.entries(monthlyMap).slice(-6);

    const formatPrice = (n: number) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-gray-400 mt-1">Store performance overview</p>
                </div>
                <Link
                    href="https://analytics.google.com"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    Open Google Analytics
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Total Revenue</span>
                        <span className="text-green-500 font-bold text-lg">₱</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Total Orders</span>
                        <ShoppingCart className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{totalOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingOrders} pending · {deliveredOrders} delivered</p>
                </div>
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Customers</span>
                        <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{customerCount || 0}</p>
                </div>
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Avg Order Value</span>
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : "₱0"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Source */}
                <div className="bg-[#1f2937] border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Order Source</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Website</span>
                                <span className="text-white font-medium">{websiteCount}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: totalOrders > 0 ? `${(websiteCount / totalOrders) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Messenger Bot</span>
                                <span className="text-white font-medium">{messengerCount}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-400 h-2 rounded-full"
                                    style={{ width: totalOrders > 0 ? `${(messengerCount / totalOrders) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mt-6 mb-4">Payment Method</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Cash on Delivery</span>
                                <span className="text-white font-medium">{codOrders}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: totalOrders > 0 ? `${(codOrders / totalOrders) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">GCash</span>
                                <span className="text-white font-medium">{gcashOrders}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-sky-400 h-2 rounded-full"
                                    style={{ width: totalOrders > 0 ? `${(gcashOrders / totalOrders) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-[#1f2937] border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        Top Products
                    </h3>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-500 text-sm">No order data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map(([name, data], i) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500 w-4">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{name}</p>
                                        <p className="text-xs text-gray-500">{data.qty} sold · {formatPrice(data.revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Revenue */}
            {monthlyRevenue.length > 0 && (
                <div className="bg-[#1f2937] border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue by Month</h3>
                    <div className="space-y-2">
                        {monthlyRevenue.map(([month, revenue]) => {
                            const max = Math.max(...monthlyRevenue.map(([, r]) => r));
                            return (
                                <div key={month} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20 shrink-0">{month}</span>
                                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: max > 0 ? `${(revenue / max) * 100}%` : "0%" }}
                                        />
                                    </div>
                                    <span className="text-xs text-white font-medium w-24 text-right shrink-0">
                                        {formatPrice(revenue)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* GA4 Link Banner */}
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-5 flex items-center justify-between">
                <div>
                    <p className="text-white font-semibold">Website Visitor Analytics</p>
                    <p className="text-gray-400 text-sm mt-1">Page views, traffic sources, and user behavior — view in Google Analytics</p>
                </div>
                <Link
                    href="https://analytics.google.com"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors shrink-0 ml-4"
                >
                    Open GA4
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
