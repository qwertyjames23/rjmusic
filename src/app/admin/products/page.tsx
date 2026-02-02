"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Debounce search term
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(currentPage, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, currentPage]);


    const fetchProducts = async (page: number, search: string) => {
        try {
            setLoading(true);

            // Calculate range
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('products')
                .select('*', { count: 'exact' });

            if (search) {
                // Search across multiple columns
                // Sanitize search input to prevent injection
                const safeSearch = search.replace(/[(),.]/g, '');
                if (safeSearch) {
                   query = query.or(`name.ilike.%${safeSearch}%,category.ilike.%${safeSearch}%,brand.ilike.%${safeSearch}%`);
                }
            }

            // Apply sorting and pagination after filtering
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (count !== null) {
                setTotalCount(count);
            }

            // Map to our type (simplified for list view)
            const mappedProducts: Product[] = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                images: p.images || [],
                category: p.category,
                brand: p.brand,
                inStock: p.in_stock,
                rating: p.rating,
                reviews: p.reviews,
                tags: p.tags,
                features: p.features
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search change
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;

            // Remove from state (optimistic update)
            setProducts(products.filter(p => p.id !== id));
            // Also decrement total count slightly incorrectly in UI until refresh, but acceptable for UX
            setTotalCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your product catalog</p>
                </div>
                <Link href="/admin/product/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20">
                    <Plus className="w-4 h-4" />
                    Add New Product
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#1f2937] border border-gray-800 rounded-xl">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-[#111827] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-700 text-gray-300 rounded-lg hover:text-white hover:border-gray-600 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#1f2937] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111827]/50 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-bold">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading products...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-[#374151]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-600">
                                                    {product.images[0] && (
                                                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white max-w-[200px] truncate" title={product.name}>{product.name}</span>
                                                    <span className="text-xs text-gray-500">{product.brand}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{product.category}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-white">
                                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.inStock ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/product/edit/${product.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Pagination */}
            <div className="flex items-center justify-between bg-[#1f2937] border border-gray-800 rounded-xl p-4">
                 <span className="text-sm text-gray-400">
                    Showing <span className="text-white font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}</span> to <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of <span className="text-white font-medium">{totalCount}</span> results
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="p-2 rounded-lg text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400 px-2">
                        Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{Math.max(1, totalPages)}</span>
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="p-2 rounded-lg text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
