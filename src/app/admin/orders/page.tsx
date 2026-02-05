import { createClient } from "@/utils/supabase/server";
import { OrdersTable } from "./_components/OrdersTable";
import { Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-8 text-red-500">Error loading orders</div>;
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
                    <p className="text-gray-400 mt-1">Manage and track all customer orders. <span className="text-green-400 text-sm">● Real-time updates enabled</span></p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="h-10 px-4 bg-[#1f2937] border border-gray-700 hover:border-gray-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        aria-label="Export orders"
                        title="Export orders"
                    >
                        <ExportIcon className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-600/20"
                        aria-label="Filter orders"
                        title="Filter orders"
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-[#1f2937] p-2 rounded-xl border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by ID, Customer Name..."
                        className="w-full bg-[#111827] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <select
                    className="bg-[#111827] border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
                    aria-label="Filter by status"
                >
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                </select>
            </div>

            {/* Real-time Orders Table */}
            <OrdersTable initialOrders={orders || []} />
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
