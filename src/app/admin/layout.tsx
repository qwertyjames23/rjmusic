import Link from "next/link";
import { LayoutDashboard, ShoppingBag, List, ShoppingCart, Users, BarChart3, Settings, LogOut, Bell, Search, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return (
        <div className="flex min-h-screen w-full bg-[#111827] text-white font-sans antialiased overflow-hidden">

            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-[#1f2937] bg-[#111827]">
                <div className="flex flex-col h-full p-4">

                    {/* Logo */}
                    <div className="flex items-center gap-3 px-3 py-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.887l-15.75 4.375a.75.75 0 01-.973-.732v-5.696a3 3 0 012.176-2.887l15.75-4.375a.75.75 0 01.675.078z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold leading-tight tracking-tight text-white">RJ MUSIC</h1>
                            <p className="text-gray-400 text-xs font-medium">Admin Console</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 flex-1">
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/10 transition-all">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        <div className="h-2"></div>

                        <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <ShoppingBag className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Products</span>
                        </Link>
                        <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <List className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Categories</span>
                        </Link>
                        <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <ShoppingCart className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Orders</span>
                        </Link>
                        <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <Users className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Customers</span>
                        </Link>
                        <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <BarChart3 className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Analytics</span>
                        </Link>

                        <div className="my-4 border-t border-[#1f2937] mx-2"></div>

                        <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <Settings className="w-5 h-5 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </nav>

                    {/* Logout */}
                    <div className="mt-auto pt-4">
                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-bold">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen ml-[260px] bg-[#111827]">
                {/* Header */}
                <header className="sticky top-0 h-20 flex items-center justify-between px-8 bg-[#111827] z-40">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-white">Overview</h2>
                        <p className="text-sm text-gray-400">Welcome back, {user?.email?.split('@')[0] || 'Admin'}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="hidden md:flex relative group w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-gray-500" />
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2.5 border border-[#1f2937] rounded-lg leading-5 bg-[#1f2937] text-white placeholder-gray-500 focus:outline-none focus:bg-[#374151] focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm transition-all"
                                placeholder="Search orders, products..."
                                type="text"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-[#111827]"></span>
                            </button>

                            <Link href="/admin/product/new" className="hidden sm:flex items-center justify-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                <Plus className="w-4 h-4" />
                                <span>Add Product</span>
                            </Link>

                            <div
                                className="h-10 w-10 rounded-full bg-[#1f2937] overflow-hidden border border-[#374151] cursor-pointer ml-2 flex items-center justify-center"
                                title={user?.email || 'Admin'}
                            >
                                <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-[#111827] uppercase">
                                    {user?.email?.slice(0, 2) || 'AD'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
