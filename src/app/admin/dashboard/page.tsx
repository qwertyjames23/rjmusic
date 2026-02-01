import { TrendingUp, ShoppingCart, Package, MoreVertical, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch Stats
    const { count: orderCount, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount');

    const totalRevenue = revenueData?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // Fetch Recent Orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="flex flex-col gap-8">

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
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(totalRevenue)}
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
                    <p className="text-3xl font-bold text-white tracking-tight">{orderCount || 0}</p>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                </div>

                {/* Products in Stock */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-[#111827] rounded-lg border border-gray-700">
                            <Package className="w-5 h-5 text-purple-500" />
                        </div>
                        {/* <span className="flex items-center text-xs font-bold text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
               - 0%
            </span> */}
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Products</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{productCount || 0}</p>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                    <button className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">View All</button>
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
                                        <tr key={order.id} className="group hover:bg-[#374151]/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-white max-w-[120px] truncate" title={order.id}>#{order.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                                                        {order.customer_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">{order.customer_name}</span>
                                                        <span className="text-xs text-gray-500">{order.customer_email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-white">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.status === 'Completed' && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                        Completed
                                                    </span>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                        Processing
                                                    </span>
                                                )}
                                                {(order.status === 'Pending' || !['Completed', 'Processing'].includes(order.status)) && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-white transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Showing 1 to {recentOrders?.length || 0} of {orderCount || 0} entries</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-50">
                                <span className="text-lg">←</span>
                            </button>
                            <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-bold shadow-sm">1</button>
                            <button className="px-3 py-1 rounded text-gray-400 hover:bg-gray-800 text-sm font-bold transition-colors">2</button>
                            <button className="px-3 py-1 rounded text-gray-400 hover:bg-gray-800 text-sm font-bold transition-colors">3</button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                                <span className="text-lg">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
