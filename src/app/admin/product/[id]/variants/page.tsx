"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Loader2,
    Package,
    GripVertical,
    Eye,
    EyeOff,
    Image as ImageIcon,
} from "lucide-react";

interface Variant {
    id: string;
    product_id: string;
    label: string;
    price: number;
    stock: number;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
}

interface ProductInfo {
    id: string;
    name: string;
    images: string[];
}

export default function ManageVariantsPage() {
    const params = useParams();
    const productId = params.id as string;
    const supabase = createClient();

    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // New variant form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVariant, setNewVariant] = useState({
        label: "",
        price: "",
        stock: "0",
        image_url: "",
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch product info
            const { data: prod } = await supabase
                .from("products")
                .select("id, name, images")
                .eq("id", productId)
                .single();

            if (prod) setProduct(prod);

            // Fetch variants via API
            const res = await fetch(`/api/admin/variants?product_id=${productId}`);
            const data = await res.json();
            if (data.variants) setVariants(data.variants);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, [productId, supabase]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showNotification = (message: string, isError = false) => {
        const div = document.createElement("div");
        div.className = `fixed top-4 right-4 ${isError ? "bg-red-500" : "bg-green-500"} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300`;
        div.textContent = isError ? `✗ ${message}` : `✓ ${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    };

    const handleAddVariant = async () => {
        if (!newVariant.label || !newVariant.price) {
            showNotification("Label and price are required", true);
            return;
        }

        setSaving("new");
        try {
            const res = await fetch("/api/admin/variants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: productId,
                    label: newVariant.label,
                    price: Number(newVariant.price),
                    stock: Number(newVariant.stock || 0),
                    image_url: newVariant.image_url || null,
                    sort_order: variants.length,
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setVariants(prev => [...prev, data.variant]);
            setNewVariant({ label: "", price: "", stock: "0", image_url: "" });
            setShowAddForm(false);
            showNotification("Variant added successfully");
        } catch (error: any) {
            showNotification(error.message || "Failed to add variant", true);
        } finally {
            setSaving(null);
        }
    };

    const handleUpdateVariant = async (variant: Variant) => {
        setSaving(variant.id);
        try {
            const res = await fetch("/api/admin/variants", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: variant.id,
                    label: variant.label,
                    price: variant.price,
                    stock: variant.stock,
                    image_url: variant.image_url,
                    sort_order: variant.sort_order,
                    is_active: variant.is_active,
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            showNotification("Variant updated");
        } catch (error: any) {
            showNotification(error.message || "Failed to update variant", true);
        } finally {
            setSaving(null);
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm("Are you sure you want to delete this variant?")) return;

        setSaving(variantId);
        try {
            const res = await fetch(
                `/api/admin/variants?id=${variantId}&product_id=${productId}`,
                { method: "DELETE" }
            );

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setVariants(prev => prev.filter(v => v.id !== variantId));
            showNotification("Variant deleted");
        } catch (error: any) {
            showNotification(error.message || "Failed to delete variant", true);
        } finally {
            setSaving(null);
        }
    };

    const handleToggleActive = async (variant: Variant) => {
        const updated = { ...variant, is_active: !variant.is_active };
        setVariants(prev => prev.map(v => (v.id === variant.id ? updated : v)));
        await handleUpdateVariant(updated);
    };

    const handleFieldChange = (variantId: string, field: keyof Variant, value: string | number) => {
        setVariants(prev =>
            prev.map(v =>
                v.id === variantId
                    ? { ...v, [field]: field === "price" || field === "stock" || field === "sort_order" ? Number(value) : value }
                    : v
            )
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-gray-400">Loading variants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Products
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Package className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Manage Variations</h1>
                            <p className="text-gray-400 mt-1">
                                {product?.name || "Product"} — {variants.length} variation{variants.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Existing Variants */}
                <div className="space-y-4 mb-6">
                    {variants.length === 0 && !showAddForm && (
                        <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-12 text-center">
                            <Package className="size-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">No Variations Yet</h3>
                            <p className="text-gray-500 mb-6">
                                Add variations like different sizes, gauges, or models
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
                            >
                                <Plus className="size-5" />
                                Add First Variation
                            </button>
                        </div>
                    )}

                    {variants.map((variant, index) => (
                        <div
                            key={variant.id}
                            className={`bg-[#0f141a] rounded-2xl border ${variant.is_active ? "border-white/10" : "border-red-500/20 opacity-60"} p-5 shadow-xl transition-all`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag handle / Order */}
                                <div className="flex flex-col items-center gap-1 pt-2">
                                    <GripVertical className="size-5 text-gray-600" />
                                    <span className="text-[10px] text-gray-500 font-mono">#{index + 1}</span>
                                </div>

                                {/* Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Label */}
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Label
                                        </label>
                                        <input
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                            value={variant.label}
                                            onChange={e => handleFieldChange(variant.id, "label", e.target.value)}
                                            placeholder="e.g. Light 10-47"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Price (₱)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                            value={variant.price}
                                            onChange={e => handleFieldChange(variant.id, "price", e.target.value)}
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                            value={variant.stock}
                                            onChange={e => handleFieldChange(variant.id, "stock", e.target.value)}
                                        />
                                    </div>

                                    {/* Image URL (optional) */}
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            <ImageIcon className="size-3 inline mr-1" />
                                            Image URL (Optional)
                                        </label>
                                        <input
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                            value={variant.image_url || ""}
                                            onChange={e => handleFieldChange(variant.id, "image_url", e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pt-5">
                                    <button
                                        onClick={() => handleUpdateVariant(variant)}
                                        disabled={saving === variant.id}
                                        className="size-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                        title="Save changes"
                                    >
                                        {saving === variant.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(variant)}
                                        className={`size-9 rounded-lg flex items-center justify-center transition-all ${variant.is_active
                                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                            : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                                            }`}
                                        title={variant.is_active ? "Disable variant" : "Enable variant"}
                                    >
                                        {variant.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVariant(variant.id)}
                                        disabled={saving === variant.id}
                                        className="size-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        title="Delete variant"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add New Variant Form */}
                {showAddForm && (
                    <div className="bg-[#0f141a] rounded-2xl border border-primary/30 p-6 shadow-xl mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Plus className="size-5 text-primary" />
                            Add New Variation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Label *
                                </label>
                                <input
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    value={newVariant.label}
                                    onChange={e => setNewVariant(prev => ({ ...prev, label: e.target.value }))}
                                    placeholder="e.g. Light 10-47, Model 11027"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Price (₱) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    value={newVariant.price}
                                    onChange={e => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    value={newVariant.stock}
                                    onChange={e => setNewVariant(prev => ({ ...prev, stock: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    <ImageIcon className="size-3 inline mr-1" />
                                    Image URL (Optional)
                                </label>
                                <input
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    value={newVariant.image_url}
                                    onChange={e => setNewVariant(prev => ({ ...prev, image_url: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewVariant({ label: "", price: "", stock: "0", image_url: "" });
                                }}
                                className="px-5 py-2.5 rounded-xl bg-[#1c222b] text-gray-400 font-semibold border border-white/10 hover:bg-[#252d38] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddVariant}
                                disabled={saving === "new"}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving === "new" ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-4" />
                                        Add Variation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Button (when form is hidden and variants exist) */}
                {!showAddForm && variants.length > 0 && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#0f141a] border-2 border-dashed border-white/10 hover:border-primary/40 text-gray-400 hover:text-white px-6 py-4 rounded-2xl transition-all group"
                    >
                        <Plus className="size-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Add Another Variation</span>
                    </button>
                )}

                {/* Preview Section */}
                {variants.length > 0 && (
                    <div className="mt-8 bg-[#0f141a] rounded-2xl border border-white/10 p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Preview — How customers see it
                        </h3>
                        <div className="bg-[#1c222b] rounded-xl p-5 border border-[#282f39]">
                            <div className="flex items-center gap-2 mb-3">
                                <Package className="size-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Variation
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {variants.filter(v => v.is_active).map((variant, i) => (
                                    <button
                                        key={variant.id}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${i === 0
                                            ? "border-primary bg-primary/10 text-primary"
                                            : variant.stock <= 0
                                                ? "border-[#282f39] bg-[#13171d] text-gray-600 opacity-50 line-through"
                                                : "border-[#282f39] bg-[#1c222b] text-gray-300"
                                            }`}
                                    >
                                        {variant.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
