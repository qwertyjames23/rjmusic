"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import { ArrowLeft, Package, DollarSign, Tag, FileText, Image as ImageIcon, Save, Loader2, Layers, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [stock, setStock] = useState("0");

    // Categories State
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [hasVariants, setHasVariants] = useState(false);

    // Variants State
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
    const VARIANT_TYPE_SUGGESTIONS = ["Model", "Size", "Color", "Gauge", "Material"];
    const [variants, setVariants] = useState<VariantItem[]>([]);
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [savingVariant, setSavingVariant] = useState<string | null>(null);
    const [newVariant, setNewVariant] = useState({ label: "", price: "", stock: "0", image_url: "", variant_type: "" });
    const lockedVariantType = variants.find((v) => (v.variant_type || "").trim())?.variant_type?.trim() || "";

    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) setCategories(data as Array<{ id: string; name: string }>);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [supabase]);

    const loadProduct = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (data) {
                setName(data.name);
                setDescription(data.description);
                setPrice(data.price.toString());
                setOriginalPrice(data.original_price ? data.original_price.toString() : "");
                setCategory(data.category);
                setBrand(data.brand || "");
                setImages(data.images || []);
                setStock(data.stock ? data.stock.toString() : "0");
                setHasVariants(data.has_variants || false);
            }
        } catch (error: unknown) {
            console.error("Error loading product:", error);
            alert("Failed to load product: " + (error instanceof Error ? error.message : "Unknown error"));
            router.push('/admin/products');
        } finally {
            setLoading(false);
        }
    }, [productId, router, supabase]);

    const loadVariants = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/variants?product_id=${productId}`);
            if (!res.ok) {
                console.warn("Variants API returned", res.status, "- table may not exist yet");
                return;
            }
            const data = await res.json();
            if (data.variants) setVariants(data.variants);
        } catch (error) {
            // Silently fail - variants table may not exist yet
            console.warn("Could not load variants:", error);
        }
    }, [productId]);

    useEffect(() => {
        Promise.all([loadProduct(), fetchCategories()]);
        // Load variants separately so it doesn't block the page
        loadVariants();
    }, [fetchCategories, loadProduct, loadVariants]);

    useEffect(() => {
        // For variable products with no variants yet, open the add form immediately.
        if (hasVariants && variants.length === 0) {
            setShowAddVariant(true);
        }
    }, [hasVariants, variants.length]);

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
        setSavingVariant("new");
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
                    variant_type: lockedVariantType || newVariant.variant_type || "Variation",
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setVariants(prev => [...prev, data.variant]);
            setNewVariant({ label: "", price: "", stock: "0", image_url: "", variant_type: "" });
            setShowAddVariant(false);
            setHasVariants(true);
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
        if (!confirm("Delete this variation?")) return;
        setSavingVariant(variantId);
        try {
            const res = await fetch(`/api/admin/variants?id=${variantId}&product_id=${productId}`, { method: "DELETE" });
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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const stockNum = Number(stock);

            const { error } = await supabase
                .from('products')
                .update({
                    name,
                    description,
                    price: hasVariants ? 0 : Number(price),
                    original_price: hasVariants ? null : (originalPrice ? Number(originalPrice) : null),
                    category,
                    brand: brand || null,
                    images,
                    stock: hasVariants ? 0 : stockNum,
                    in_stock: hasVariants ? false : stockNum > 0, // Auto-sync
                    has_variants: hasVariants,
                })
                .eq('id', productId);

            if (error) throw error;

            // Success notification
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            successDiv.innerHTML = '✓ Product updated successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

            // Redirect to products page (refresh to force re-fetch)
            setTimeout(() => { router.refresh(); router.push('/admin/products'); }, 1500);

        } catch (error: unknown) {
            console.error(error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            errorDiv.innerHTML = '✗ Error: ' + (error instanceof Error ? error.message : 'Unknown error');
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-gray-400">Loading product...</p>
                </div>
            </div>
        );
    }

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
                        <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Package className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Edit Product</h1>
                            <p className="text-gray-400 mt-1">Update product information</p>
                        </div>
                    </div>
                </div>

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
                                    onChange={e => setBrand(e.target.value)}
                                    placeholder="e.g. Fender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Category *</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                    <select
                                        className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                        value={category}
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

                        {(hasVariants || showAddVariant || variants.length > 0) ? (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                                <div className="text-blue-400 font-medium">
                                    Product has variations. Pricing and stock are managed individually below.
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Price (PHP) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 pl-8 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            value={price}
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
                                        required
                                        min="0"
                                        className="w-full bg-[#1c222b] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={stock}
                                        onChange={e => setStock(e.target.value)}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status will automatically allow &apos;Out of Stock&apos; if 0.
                                    </p>
                                </div>
                            </div>
                        )}
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
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the product features, specifications, and benefits..."
                        />
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
                                                    list="variant-type-suggestions"
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
                                {/* HTML datalist for type suggestions */}
                                <datalist id="variant-type-suggestions">
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
                                            list="variant-type-suggestions-new"
                                        />
                                        <datalist id="variant-type-suggestions-new">
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

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin/products"
                            className="flex-1 bg-[#1c222b] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#252d38] transition-all border border-white/10 text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="size-5 group-hover:scale-110 transition-transform" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

