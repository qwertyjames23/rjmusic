import { createClient } from "@/utils/supabase/server";
import { Search, Filter, Mail, Calendar, Shield, MoreVertical, Users, ShoppingBag, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
    updated_at: string;
}

interface CustomerWithStats extends Profile {
    total_orders: number;
    total_spent: number;
}

export default async function CustomersPage() {
    const supabase = await createClient();

    // Fetch all profiles (customers)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profilesError) {
        return (
            <div className="p-8 text-red-500 border border-red-500/20 rounded-xl bg-red-500/10">
                <h3 className="font-bold text-lg mb-2">Error Loading Customers</h3>
                <p className="text-sm opacity-80 mb-4">
                    The profiles table seems to be missing or inaccessible.
                </p>
                <div className="bg-black/50 p-4 rounded-lg overflow-auto text-xs font-mono">
                    {JSON.stringify(profilesError, null, 2)}
                </div>
            </div>
        );
    }

    // Fetch order stats for each customer
    const customersWithStats: CustomerWithStats[] = [];

    for (const profile of profiles || []) {
        const { data: orders } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', profile.id);

        const totalOrders = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        customersWithStats.push({
            ...profile,
            total_orders: totalOrders,
            total_spent: totalSpent,
        });
    }

    // Calculate summary stats
    const totalCustomers = customersWithStats.length;
    const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.total_spent, 0);
    const activeCustomers = customersWithStats.filter(c => c.total_orders > 0).length;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Customers</h1>
                    <p className="text-gray-400 mt-1">Manage and view all registered customers.</p>
                </div>
                <div className="flex gap-2">
                    <button className="h-10 px-4 bg-[#1f2937] border border-gray-700 hover:border-gray-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                        <ExportIcon className="w-4 h-4" />
                        Export
                    </button>
                    <button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-600/20">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Customers</p>
                            <p className="text-2xl font-bold text-white">{totalCustomers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Active Customers</p>
                            <p className="text-2xl font-bold text-white">{activeCustomers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-[#1f2937] p-2 rounded-xl border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        className="w-full bg-[#111827] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <select aria-label="Filter by role" className="bg-[#111827] border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                    <option>All Roles</option>
                    <option>Admin</option>
                    <option>Customer</option>
                </select>
            </div>

            {/* Customers Table */}
            <div className="bg-[#1f2937] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111827]/50 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-bold">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1f2937]">
                            {!customersWithStats || customersWithStats.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                customersWithStats.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-[#374151]/30 transition-colors border-b border-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white uppercase">
                                                    {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white">
                                                        {customer.full_name || 'No name set'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {customer.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customer.role === 'admin'
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                                                : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                                }`}>
                                                <Shield className="w-3 h-3" />
                                                {customer.role || 'customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {customer.total_orders}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-white">
                                            {formatPrice(customer.total_spent)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {customer.created_at ? formatDate(customer.created_at) : 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    View Profile
                                                </button>
                                                <button aria-label="More options" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ExportIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    )
}
