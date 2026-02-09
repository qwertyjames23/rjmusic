"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types";
import Image from "next/image";
import { Loader2, AlertTriangle, Search, Filter, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminInventoryPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            const mappedProducts: Product[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                originalPrice: item.original_price ?? undefined,
                category: item.category,
                brand: item.brand,
                images: item.images || [],
                inStock: item.in_stock,
                stock: item.stock || 0,
                rating: item.rating,
                reviews: item.reviews,
                tags: (item.tags as any) || [],
                features: item.features || []
            }));

            setProducts(mappedProducts);
        } catch (error: any) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = async (id: string, newStock: number) => {
        if (newStock < 0) return;

        // Optimistic UI update
        setProducts(prev => prev.map(p =>
            p.id === id ? {
                ...p,
                stock: newStock,
                inStock: newStock > 0
            } : p
        ));

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    stock: newStock,
                    in_stock: newStock > 0
                })
                .eq('id', id);

            if (error) throw error;

            // Show brief success message (optional, might be annoying if too frequent)
            // setNotification({ message: "Stock updated", type: "success" });
            // setTimeout(() => setNotification(null), 2000);

        } catch (error) {
            console.error("Error updating stock:", error);
            // Revert on error
            loadProducts();
            setNotification({ message: "Failed to update stock", type: "error" });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'low') return matchesSearch && (product.stock || 0) <= 5 && (product.stock || 0) > 0;
        if (filter === 'out') return matchesSearch && (product.stock || 0) === 0;

        return matchesSearch;
    });

    const lowStockCount = products.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length;
    const outStockCount = products.filter(p => (p.stock || 0) === 0).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={cn(
                    "fixed top-24 right-8 px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-300 flex items-center gap-3",
                    notification.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}>
                    {notification.type === 'error' && <AlertTriangle className="size-5" />}
                    {notification.type === 'success' && <ClipboardList className="size-5" />}
                    <span className="font-semibold">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
                    <p className="text-gray-400">Track and manage your product stock levels.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center bg-[#1f2937] p-1 rounded-lg border border-gray-700">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            filter === 'all' ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        All Products
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            filter === 'low' ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Low Stock
                        {lowStockCount > 0 && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{lowStockCount}</span>}
                    </button>
                    <button
                        onClick={() => setFilter('out')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            filter === 'out' ? "bg-red-500/20 text-red-400 border border-red-500/50" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Out of Stock
                        {outStockCount > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{outStockCount}</span>}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by product name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1f2937] border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>

            {/* Table */}
            <div className="bg-[#0f141a] rounded-xl border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c222b] border-b border-white/10">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">SKU / ID</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Level</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-lg overflow-hidden bg-white/5 shrink-0 relative border border-white/10">
                                                <Image
                                                    src={product.images[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-gray-500">{product.id.split('-')[0]}...</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-300">
                                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStockChange(product.id, (product.stock || 0) - 1)}
                                                className="size-8 rounded-lg bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className="w-20 bg-[#111827] border border-gray-700 rounded-lg py-1.5 text-center text-white font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                                value={product.stock ?? 0}
                                                onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                                                min="0"
                                            />
                                            <button
                                                onClick={() => handleStockChange(product.id, (product.stock || 0) + 1)}
                                                className="size-8 rounded-lg bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(product.stock ?? 0) === 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                Out of Stock
                                            </span>
                                        ) : (product.stock ?? 0) <= 5 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No products found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
