"use client";

import { Fragment, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Use authenticated client
import { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Save, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";

type VariantRow = {
    product_id: string;
    label: string | null;
    price: number | null;
    stock: number | null;
    is_active: boolean | null;
    variant_type: string | null;
};
type VariantDetail = { label: string; price: number; stock: number };
type VariantMetaEntry = {
    count: number;
    totalStock: number;
    minPrice: number;
    labels: string[];
    groups: Record<string, VariantDetail[]>;
};

export default function AdminProductsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    // For handling stock edits directly
    const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
    const [variantMeta, setVariantMeta] = useState<Record<string, VariantMetaEntry>>({});

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

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
                stock: item.stock || 0, // Ensure stock is mapped
                rating: item.rating,
                reviews: item.reviews,
                tags: (item.tags as any) || [],
                features: item.features || []
            }));

            setProducts(mappedProducts);

            const productIds = mappedProducts.map(p => p.id);
            if (productIds.length > 0) {
                const { data: variantRows } = await supabase
                    .from("product_variants")
                    .select("product_id,label,price,stock,is_active,variant_type")
                    .in("product_id", productIds)
                    .neq("is_active", false);

                const meta: Record<string, VariantMetaEntry> = {};
                (variantRows as VariantRow[] || []).forEach((v) => {
                    if (!meta[v.product_id]) {
                        meta[v.product_id] = {
                            count: 0,
                            totalStock: 0,
                            minPrice: Number(v.price || 0),
                            labels: [],
                            groups: {},
                        };
                    }
                    meta[v.product_id].count += 1;
                    meta[v.product_id].totalStock += Number(v.stock || 0);
                    meta[v.product_id].minPrice = Math.min(meta[v.product_id].minPrice, Number(v.price || 0));
                    if (v.label) meta[v.product_id].labels.push(v.label);
                    const groupName = v.variant_type || "Variation";
                    if (!meta[v.product_id].groups[groupName]) {
                        meta[v.product_id].groups[groupName] = [];
                    }
                    meta[v.product_id].groups[groupName].push({
                        label: v.label || "Unnamed",
                        price: Number(v.price || 0),
                        stock: Number(v.stock || 0),
                    });
                });
                setVariantMeta(meta);
            } else {
                setVariantMeta({});
            }
        } catch (error: any) {
            console.error("Error loading products:", error);
            alert("Failed to load products: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = async (id: string, newStock: number) => {
        if (newStock < 0) return;

        // Optimistic UI update
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stock: newStock, inStock: newStock > 0 } : p
        ));

        try {
            const { error } = await supabase
                .from('products')
                .update({ stock: newStock, in_stock: newStock > 0 })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating stock:", error);
            // Revert changes on error
            loadProducts();
        }
    };

    const handleDeleteClick = (product: Product) => {
        setDeleteModal({ isOpen: true, product });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.product) return;

        const { id } = deleteModal.product;
        setDeleting(id);

        try {
            const res = await fetch('/api/admin/delete-product', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: [id] }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete product');

            // Success notification
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            successDiv.innerHTML = '✓ Product deleted successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

            // Close modal and refresh list
            setDeleteModal({ isOpen: false, product: null });
            await loadProducts();
        } catch (error: any) {
            console.error("Error deleting product:", error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            errorDiv.innerHTML = '✗ Failed to delete product: ' + error.message;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const handleSelectAll = () => {
        if (selectedProducts.size === products.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(products.map(p => p.id)));
        }
    };

    const handleSelectProduct = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    const toggleExpandedProduct = (productId: string) => {
        setExpandedProducts((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.size === 0) return;

        const productIds = Array.from(selectedProducts);
        setDeleting('bulk');
        try {
            const res = await fetch('/api/admin/delete-product', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete products');

            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            successDiv.innerHTML = `✓ ${selectedProducts.size} product(s) deleted successfully!`;
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

            setBulkDeleteModal(false);
            setSelectedProducts(new Set());
            await loadProducts();
        } catch (error: unknown) {
            console.error("Error deleting products:", error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            errorDiv.innerHTML = '✗ Failed to delete products';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header with Bulk Actions */}
            {selectedProducts.size > 0 ? (
                <div className="mb-8 bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold">{selectedProducts.size}</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-sm text-gray-400">Choose an action to perform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={() => setBulkDeleteModal(true)}
                            disabled={deleting === 'bulk'}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleting === 'bulk' ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4" />
                                    Delete Selected
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Products</h1>
                        <p className="text-gray-400 mt-1">{products.length} total products</p>
                    </div>
                    <Link
                        href="/admin/product/new"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-5" />
                        Add Product
                    </Link>
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-20 bg-[#0f141a] rounded-xl border border-white/10">
                    <p className="text-gray-400 mb-4">No products found</p>
                    <Link
                        href="/admin/product/new"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <Plus className="size-4" />
                        Create your first product
                    </Link>
                </div>
            ) : (
                <div className="bg-[#0f141a] rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#1c222b] border-b border-white/10">
                                <tr>
                                    <th className="w-12 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.size === products.length && products.length > 0}
                                            onChange={handleSelectAll}
                                            className="size-4 rounded border-white/20 bg-[#0f141a] text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                            title="Select all products"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Product</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Stock</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Variations</th>
                                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Rating</th>
                                    <th className="text-right px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => {
                                    const productVariants = variantMeta[product.id];
                                    const hasVariants = (productVariants?.count ?? 0) > 0;
                                    const isExpanded = expandedProducts.has(product.id);
                                    const flattenedVariants = hasVariants
                                        ? Object.entries(productVariants.groups).flatMap(([group, items]) =>
                                            items.map((item, idx) => ({
                                                key: `${group}-${idx}`,
                                                group,
                                                ...item,
                                            }))
                                        )
                                        : [];

                                    return (
                                    <Fragment key={product.id}>
                                    <tr className={`hover:bg-white/5 transition-colors ${selectedProducts.has(product.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.has(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                                className="size-4 rounded border-white/20 bg-[#0f141a] text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                                aria-label={`Select ${product.name}`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-16 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                                                    <Image
                                                        src={product.images[0] || 'https://placehold.co/100x100/101822/FFF?text=No+Image'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white truncate">{product.name}</p>
                                                    <p className="text-sm text-gray-400">{product.brand}</p>
                                                    {hasVariants && <p className="text-xs text-purple-400 mt-1">{productVariants.count} variation(s)</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">
                                                {hasVariants
                                                    ? formatPrice(productVariants.minPrice)
                                                    : formatPrice(product.price)}
                                            </p>
                                            {hasVariants && (
                                                <p className="text-xs text-purple-400 mt-1">From variations</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-[#1c222b] border border-white/10 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                    value={hasVariants ? productVariants.totalStock : (product.stock ?? 0)}
                                                    onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                                                    disabled={hasVariants}
                                                    min="0"
                                                />
                                                {hasVariants && (
                                                    <span className="text-xs text-purple-400 font-bold">Managed by variations</span>
                                                )}
                                                {(hasVariants ? productVariants.totalStock : (product.stock ?? 0)) <= 5 && (hasVariants ? productVariants.totalStock : (product.stock ?? 0)) > 0 && (
                                                    <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="size-3" /> Low Stock
                                                    </span>
                                                )}
                                                {(hasVariants ? productVariants.totalStock : (product.stock ?? 0)) === 0 && (
                                                    <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="size-3" /> Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hasVariants ? (
                                                <button
                                                    onClick={() => toggleExpandedProduct(product.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs font-semibold"
                                                >
                                                    {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                                    {productVariants.count} variation(s)
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500">No variations</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-white font-medium">{product.rating}</span>
                                                <span className="text-gray-400 text-sm">({product.reviews})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/admin/product/${product.id}/edit`)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/product/${product.id}/variants`)}
                                                    className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                    title="Manage Variants"
                                                >
                                                    <Layers className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    disabled={deleting === product.id}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleting === product.id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {hasVariants && isExpanded && flattenedVariants.map((variant) => (
                                        <tr key={`${product.id}-variant-${variant.key}`} className="bg-[#0b1016] border-t border-purple-500/10">
                                            <td className="px-6 py-3" />
                                            <td className="px-6 py-3">
                                                <p className="text-sm text-purple-300 font-semibold truncate">{"-> "}{variant.group}: {variant.label}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-bold text-white">{formatPrice(variant.price)}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-white text-sm font-semibold">{variant.stock}</p>
                                                    {variant.stock <= 5 && variant.stock > 0 && (
                                                        <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
                                                            <AlertTriangle className="size-3" /> Low Stock
                                                        </span>
                                                    )}
                                                    {variant.stock === 0 && (
                                                        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                            <AlertTriangle className="size-3" /> Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs text-purple-300">Child variation</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-gray-500">-</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/product/${product.id}/variants`)}
                                                        className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                        title="Manage Variants"
                                                    >
                                                        <Layers className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </Fragment>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, product: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Product?"
                message="Are you sure you want to delete this product? This will remove it from your store."
                itemName={deleteModal.product?.name}
                isDeleting={deleting !== null}
            />

            {/* Bulk Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Products?"
                message={`Are you sure you want to delete ${selectedProducts.size} product${selectedProducts.size > 1 ? 's' : ''}? This will remove them from your store.`}
                isDeleting={deleting === 'bulk'}
            />
        </div>
    );
}
