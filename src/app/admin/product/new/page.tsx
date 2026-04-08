"use client";

import { useCallback, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ui/image-upload";
import { ArrowLeft, Package, DollarSign, Tag, FileText, Image as ImageIcon, Sparkles, Loader2, Layers, Plus, Trash2, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface VariantItem {
    id: string;
    product_id: string;
    label: string;
    price: number;
    stock: number;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    variant_type: string | null;
}
interface CategoryOption {
    id: string;
    name: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    return fallback;
}
const VARIANT_TYPE_SUGGESTIONS = ["Model", "Size", "Color", "Gauge", "Material"];

export default function AdminProductForm() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [stock, setStock] = useState("0");
    const [hasVariants, setHasVariants] = useState(false);

    // Categories State
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // Created product ID — when set, the product has been saved and we show the variations section
    const [createdProductId, setCreatedProductId] = useState<string | null>(null);

    // Variants State (visible after product creation)
    const [variants, setVariants] = useState<VariantItem[]>([]);
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [savingVariant, setSavingVariant] = useState<string | null>(null);
    const [newVariant, setNewVariant] = useState({ label: "", price: "", stock: "0", image_url: "", variant_type: "" });
    const [firstVariant, setFirstVariant] = useState({ label: "", price: "", stock: "0", variant_type: "" });
    const lockedVariantType = variants.find((v) => (v.variant_type || "").trim())?.variant_type?.trim() || "";

    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) setCategories(data as CategoryOption[]);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [supabase]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const showNotification = (message: string, isError = false) => {
        const div = document.createElement("div");
        div.className = `fixed top-4 right-4 ${isError ? "bg-red-500" : "bg-green-500"} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300`;
        div.textContent = isError ? `✗ ${message}` : `✓ ${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (hasVariants && (!firstVariant.label.trim() || !firstVariant.price)) {
                showNotification("For variable products, first variation label and price are required", true);
                return;
            }

            const stockNum = Number(stock);

            const { data: newProduct, error } = await supabase.from('products').insert({
                name,
                description,
                price: hasVariants ? 0 : Number(price),
                original_price: hasVariants ? null : (originalPrice ? Number(originalPrice) : null),
                category,
                brand,
                images,
                stock: hasVariants ? 0 : stockNum,
                in_stock: hasVariants ? false : stockNum > 0, // Variable products depend on variant stock
                has_variants: hasVariants,
                rating: 0,
                reviews: 0
            }).select('id').single();

            if (error) throw error;

            showNotification("Product created successfully! You can now add variations below.");

            // Set the created product ID to reveal the variations section
            setCreatedProductId(newProduct.id);
            if (hasVariants) {
                const res = await fetch("/api/admin/variants", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: newProduct.id,
                        label: firstVariant.label.trim(),
                        price: Number(firstVariant.price),
                        stock: Number(firstVariant.stock || 0),
                        sort_order: 0,
                        ...(firstVariant.variant_type ? { variant_type: firstVariant.variant_type } : {}),
                    }),
                });
                const data = await res.json();
                if (data.error) {
                    setShowAddVariant(true);
                    showNotification(`Product created, but first variation failed: ${data.error}`, true);
                } else {
                    setVariants([data.variant]);
                    setShowAddVariant(false);
                    setFirstVariant({ label: "", price: "", stock: "0", variant_type: "" });
                }
            }

        } catch (error: unknown) {
            console.error(error);
            showNotification("Error: " + getErrorMessage(error, "Unknown error"), true);
        } finally {
            setLoading(false);
        }
    };

    // --- Variant handlers (only used after product is created) ---

    const handleAddVariant = async () => {
        if (!createdProductId) return;
        if (!newVariant.label || !newVariant.price) {
            showNotification("Label and price are required", true);
            return;
        }
        setSavingVariant("new");
        try {
            const res = await fetch("/api/admin/variants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: createdProductId,
                        label: newVariant.label,
                        price: Number(newVariant.price),
                        stock: Number(newVariant.stock || 0),
                        image_url: newVariant.image_url || null,
                        sort_order: variants.length,
                        variant_type: lockedVariantType || newVariant.variant_type || "Variation",
                    }),
                });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setVariants(prev => [...prev, data.variant]);
            setNewVariant({ label: "", price: "", stock: "0", image_url: "", variant_type: "" });
            setShowAddVariant(false);
            setHasVariants(true); // Ensure UI reflects that product now has variants
            showNotification("Variation added");
        } catch (error: unknown) {
            showNotification(error instanceof Error ? error.message : "Failed to add variation", true);
        } finally {
            setSavingVariant(null);
        }
    };

    const handleUpdateVariant = async (variant: VariantItem) => {
        setSavingVariant(variant.id);
        try {
            const res = await fetch("/api/admin/variants", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(variant),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            showNotification("Variation updated");
        } catch (error: unknown) {
            showNotification(error instanceof Error ? error.message : "Failed to update", true);
        } finally {
            setSavingVariant(null);
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!createdProductId) return;
        if (!confirm("Delete this variation?")) return;
        setSavingVariant(variantId);
        try {
            const res = await fetch(`/api/admin/variants?id=${variantId}&product_id=${createdProductId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setVariants(prev => prev.filter(v => v.id !== variantId));
            showNotification("Variation deleted");
        } catch (error: unknown) {
            showNotification(error instanceof Error ? error.message : "Failed to delete", true);
        } finally {
            setSavingVariant(null);
        }
    };

    const handleVariantFieldChange = (variantId: string, field: keyof VariantItem, value: string | number) => {
        setVariants(prev =>
            prev.map(v =>
                v.id === variantId
                    ? { ...v, [field]: field === "price" || field === "stock" || field === "sort_order" ? Number(value) : value }
                    : v
            )
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
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
                        <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {createdProductId ? "Product Created — Add Variations" : "Add New Product"}
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {createdProductId
                                    ? "Your product has been saved. Add variations below, or go back to products."
                                    : "Create a new product listing for your store"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form — Always visible, but disabled after creation */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ImageIcon className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Product Images</h2>
                                <p className="text-sm text-gray-400">Upload high-quality images (recommended: 1200x800px)</p>
                            </div>
                        </div>
                        <ImageUpload
                            value={images}
                            disabled={loading || !!createdProductId}
                            onChange={(url) => setImages(prev => [...prev, url])}
                            onRemove={(url) => setImages(prev => prev.filter((current) => current !== url))}
                        />
                    </div>

                    {/* Basic Information */}
                    <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Basic Information</h2>
                                <p className="text-sm text-gray-400">Essential product details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Product Name *</label>
                                <input
                                    required
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    value={name}
                                    disabled={loading || !!createdProductId}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Fender Stratocaster Ultra"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">
                                    Brand <span className="text-gray-500 font-normal text-xs">(Optional)</span>
                                </label>
                                <input
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    value={brand}
                                    disabled={loading || !!createdProductId}
                                    onChange={e => setBrand(e.target.value)}
                                    placeholder="e.g. Fender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Category *</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                    <select
                                        required
                                        className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50"
                                        value={category}
                                        disabled={loading || !!createdProductId}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <DollarSign className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Pricing & Stock</h2>
                                <p className="text-sm text-gray-400">Set your product pricing and inventory</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 bg-[#1c222b] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="hasVariants"
                                    className="size-5 rounded border-gray-600 bg-[#13171d] text-primary focus:ring-primary/20"
                                    checked={hasVariants}
                                    disabled={loading || !!createdProductId}
                                    onChange={e => setHasVariants(e.target.checked)}
                                />
                                <label htmlFor="hasVariants" className="text-sm font-medium text-white cursor-pointer select-none">
                                    This product has variations (e.g. Size, Color)
                                    <span className="block text-xs text-gray-500 mt-0.5">
                                        Pricing and stock will be managed exclusively by variations.
                                    </span>
                                </label>
                            </div>

                            {!hasVariants && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-300">Price (PHP) *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required={!hasVariants}
                                                className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 pl-8 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                value={price}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setPrice(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-300">Original Price (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 pl-8 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                value={originalPrice}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setOriginalPrice(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">For sale items, show original price</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-300">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            required={!hasVariants}
                                            min="0"
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            value={stock}
                                            disabled={loading || !!createdProductId}
                                            onChange={e => setStock(e.target.value)}
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Base stock for the product. If you add variations below, each variation will have its own stock.
                                        </p>
                                    </div>
                                </>
                            )}
                            {hasVariants && (
                                <div className="md:col-span-2 bg-[#1c222b] border border-purple-500/30 rounded-xl p-4 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-purple-400">First Variation</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Set the first variation now. You can add more after product creation.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                            <input
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={firstVariant.variant_type}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setFirstVariant(prev => ({ ...prev, variant_type: e.target.value }))}
                                                placeholder="e.g. Model, Size"
                                                list="first-variant-type-suggestions"
                                            />
                                            <datalist id="first-variant-type-suggestions">
                                                {VARIANT_TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                                            </datalist>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label *</label>
                                            <input
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={firstVariant.label}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setFirstVariant(prev => ({ ...prev, label: e.target.value }))}
                                                placeholder="e.g. Light 10-47"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (PHP) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={firstVariant.price}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setFirstVariant(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={firstVariant.stock}
                                                disabled={loading || !!createdProductId}
                                                onChange={e => setFirstVariant(prev => ({ ...prev, stock: e.target.value }))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Description</h2>
                                <p className="text-sm text-gray-400">Detailed product information</p>
                            </div>
                        </div>
                        <textarea
                            required
                            className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[150px] resize-y"
                            value={description}
                            disabled={loading || !!createdProductId}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the product features, specifications, and benefits..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin/products"
                            className="flex-1 bg-[#1c222b] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#252d38] transition-all border border-white/10 text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || !!createdProductId}
                            className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group ${createdProductId
                                ? "bg-green-500/20 text-green-500 border border-green-500/30 cursor-default"
                                : "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Creating Product...
                                </>
                            ) : createdProductId ? (
                                <>
                                    <CheckCircle2 className="size-5" />
                                    Product Created
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-5 group-hover:rotate-12 transition-transform" />
                                    {hasVariants ? "Create & Add Variations" : "Create Product"}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Product Variations Section — shown immediately after the product is created */}
                {createdProductId && (
                    <div className="space-y-6">
                        {/* Success banner */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                <Sparkles className="size-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-green-400 font-bold">Product &ldquo;{name}&rdquo; created successfully!</p>
                                <p className="text-green-400/70 text-sm">You can now add variations below, or go back to products.</p>
                            </div>
                        </div>

                        {/* Product Variations */}
                        <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Layers className="size-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Product Variations</h2>
                                        <p className="text-sm text-gray-400">Add different models, sizes, or gauges</p>
                                    </div>
                                </div>
                                {!showAddVariant && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddVariant(true)}
                                        className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-purple-500/20 transition-all"
                                    >
                                        <Plus className="size-4" />
                                        Add Variation
                                    </button>
                                )}
                            </div>

                            {/* Existing Variants */}
                            {variants.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className={`bg-[#1c222b] rounded-xl border ${variant.is_active ? 'border-white/10' : 'border-red-500/20 opacity-60'} p-4 transition-all`}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                                    <input
                                                        className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                        value={lockedVariantType || variant.variant_type || ""}
                                                        onChange={e => handleVariantFieldChange(variant.id, 'variant_type', e.target.value)}
                                                        disabled={!!lockedVariantType}
                                                        placeholder="e.g. Model"
                                                        list="variant-type-suggestions-new-page"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                                                    <input
                                                        className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                        value={variant.label}
                                                        onChange={e => handleVariantFieldChange(variant.id, 'label', e.target.value)}
                                                        placeholder="e.g. Light 10-47"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (₱)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                        value={variant.price}
                                                        onChange={e => handleVariantFieldChange(variant.id, 'price', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                        value={variant.stock}
                                                        onChange={e => handleVariantFieldChange(variant.id, 'stock', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-3 flex items-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateVariant(variant)}
                                                        disabled={savingVariant === variant.id}
                                                        className="size-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all disabled:opacity-50 shrink-0"
                                                        title="Save changes"
                                                    >
                                                        {savingVariant === variant.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = { ...variant, is_active: !variant.is_active };
                                                            setVariants(prev => prev.map(v => v.id === variant.id ? updated : v));
                                                            handleUpdateVariant(updated);
                                                        }}
                                                        className={`size-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${variant.is_active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                                                            }`}
                                                        title={variant.is_active ? 'Disable' : 'Enable'}
                                                    >
                                                        {variant.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteVariant(variant.id)}
                                                        disabled={savingVariant === variant.id}
                                                        className="size-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50 shrink-0"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <datalist id="variant-type-suggestions-new-page">
                                        {VARIANT_TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                                    </datalist>
                                </div>
                            )}

                            {/* Add New Variant Form */}
                            {showAddVariant && (
                                <div className="bg-[#1c222b] rounded-xl border border-purple-500/30 p-4 mt-4">
                                    <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <Plus className="size-4" />
                                        New Variation
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                            <input
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={lockedVariantType || newVariant.variant_type}
                                                onChange={e => setNewVariant(prev => ({ ...prev, variant_type: e.target.value }))}
                                                disabled={!!lockedVariantType}
                                                placeholder="e.g. Model, Size"
                                                list="variant-type-suggestions-new-form"
                                            />
                                            <datalist id="variant-type-suggestions-new-form">
                                                {VARIANT_TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                                            </datalist>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Label *</label>
                                            <input
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={newVariant.label}
                                                onChange={e => setNewVariant(prev => ({ ...prev, label: e.target.value }))}
                                                placeholder="e.g. Light 10-47"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (₱) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={newVariant.price}
                                                onChange={e => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-[#13171d] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                                value={newVariant.stock}
                                                onChange={e => setNewVariant(prev => ({ ...prev, stock: e.target.value }))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddVariant(false); setNewVariant({ label: "", price: "", stock: "0", image_url: "", variant_type: "" }); }}
                                            className="px-4 py-2 rounded-lg bg-[#13171d] text-gray-400 font-semibold text-sm border border-white/10 hover:bg-[#1c222b] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddVariant}
                                            disabled={savingVariant === "new"}
                                            className="px-4 py-2 rounded-lg bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingVariant === "new" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}

                            {variants.length === 0 && !showAddVariant && (
                                <div className="text-center py-8 text-gray-500">
                                    <Layers className="size-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No variations yet. Click &ldquo;Add Variation&rdquo; to get started.</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation buttons after creation */}
                        <div className="flex gap-4">
                            <Link
                                href="/admin/products"
                                className="flex-1 bg-[#1c222b] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#252d38] transition-all border border-white/10 text-center"
                            >
                                Back to Products
                            </Link>
                            <Link
                                href={`/admin/product/${createdProductId}/edit`}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Package className="size-5" />
                                Edit Full Product
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
