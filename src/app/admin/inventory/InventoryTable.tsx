"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import Image from "next/image";

type InventoryProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    images?: string[];
};

type VariantRow = {
    product_id: string;
    label: string | null;
    stock: number | null;
    is_active: boolean | null;
};

export function InventoryTable({ initialProducts }: { initialProducts: InventoryProduct[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
    const [variantMeta, setVariantMeta] = useState<Record<string, { count: number; totalStock: number; labels: string[] }>>({});

    useEffect(() => {
        const loadVariantMeta = async () => {
            const productIds = initialProducts.map(p => p.id);
            if (productIds.length === 0) return;

            const supabase = createClient();
            const { data } = await supabase
                .from("product_variants")
                .select("product_id,label,stock,is_active")
                .in("product_id", productIds)
                .neq("is_active", false);

            const meta: Record<string, { count: number; totalStock: number; labels: string[] }> = {};
            (data as VariantRow[] | null || []).forEach((v) => {
                if (!meta[v.product_id]) {
                    meta[v.product_id] = { count: 0, totalStock: 0, labels: [] };
                }
                meta[v.product_id].count += 1;
                meta[v.product_id].totalStock += Number(v.stock || 0);
                if (v.label) meta[v.product_id].labels.push(v.label);
            });
            setVariantMeta(meta);
        };

        loadVariantMeta();
    }, [initialProducts]);

    const handleStockChange = (id: string, value: string) => {
        const num = parseInt(value);
        if (!isNaN(num) && num >= 0) {
            setStockUpdates(prev => ({ ...prev, [id]: num }));
        }
    };

    const saveStock = async (id: string) => {
        const newStock = stockUpdates[id];
        if (newStock === undefined) return;

        setLoadingId(id);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("products")
                .update({ 
                    stock: newStock,
                    in_stock: newStock > 0 
                })
                .eq("id", id);

            if (error) throw error;
            
            // Clear the update state for this item
            const newUpdates = { ...stockUpdates };
            delete newUpdates[id];
            setStockUpdates(newUpdates);
            
            router.refresh();
        } catch (error) {
            console.error("Error updating stock:", error);
            alert("Failed to update stock");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Current Stock</th>
                            <th className="p-4">Update Stock</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="relative size-10 bg-white/5 rounded overflow-hidden shrink-0">
                                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
                                    </div>
                                    <div>
                                        <span className="font-medium text-white">{product.name}</span>
                                        {variantMeta[product.id]?.count > 0 && (
                                            <p className="text-xs text-purple-400">
                                                {variantMeta[product.id].count} variation(s): {variantMeta[product.id].labels.slice(0, 2).join(", ")}
                                                {variantMeta[product.id].labels.length > 2 ? "..." : ""}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">{product.category}</td>
                                <td className="p-4 text-white">₱{product.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {variantMeta[product.id]?.count > 0 ? variantMeta[product.id].totalStock : (product.stock || 0)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={variantMeta[product.id]?.count > 0 ? variantMeta[product.id].totalStock : (stockUpdates[product.id] ?? product.stock ?? 0)}
                                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                                        disabled={variantMeta[product.id]?.count > 0}
                                        className="w-20 bg-[#0a0d11] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-primary"
                                    />
                                    {variantMeta[product.id]?.count > 0 && (
                                        <p className="text-xs text-purple-400 mt-1">Managed by variations</p>
                                    )}
                                </td>
                                <td className="p-4">
                                    {variantMeta[product.id]?.count === undefined && stockUpdates[product.id] !== undefined && stockUpdates[product.id] !== product.stock && (
                                        <button 
                                            onClick={() => saveStock(product.id)}
                                            disabled={loadingId === product.id}
                                            className="p-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {loadingId === product.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
