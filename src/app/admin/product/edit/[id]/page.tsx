"use client";

import { useCallback, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import {
    ArrowLeft, Tag, FileText, Image as ImageIcon,
    Loader2, Plus, Trash2, LayoutGrid
} from "lucide-react";
import Link from "next/link";

interface VariantItem {
    id: string; // can be temporary for new variants
    product_id?: string;
    label: string;
    price: number;
    stock: number;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    variant_type: string | null;
}

const SECTIONS = [
    { id: "basic-info", label: "Basic Information", icon: FileText },
    { id: "sales-info", label: "Sales Information", icon: Tag },
    { id: "media", label: "Media Management", icon: ImageIcon },
    // { id: "shipping", label: "Shipping", icon: Truck },
];

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();

    const [id, setId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState("basic-info");

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);

    // Sales State
    const [hasVariants, setHasVariants] = useState(false);
    const [price, setPrice] = useState(""); // Base price
    const [stock, setStock] = useState(""); // Base stock
    const [originalPrice, setOriginalPrice] = useState("");

    // Variations Matrix State
    const [variants, setVariants] = useState<VariantItem[]>([]);

    // Experimental: Tiered Variation Builder State
    // We keep track of the "structure" locally to generate the matrix
    const [variation1Name, setVariation1Name] = useState("Variation 1");
    const [variation1Options, setVariation1Options] = useState<string[]>([]);
    const [variation1Input, setVariation1Input] = useState("");

    const [variation2Name, setVariation2Name] = useState("Variation 2");
    const [variation2Options, setVariation2Options] = useState<string[]>([]);
    const [variation2Input, setVariation2Input] = useState("");

    // Batch Edit State
    const [batchPrice, setBatchPrice] = useState("");
    const [batchStock, setBatchStock] = useState("");

    // Categories
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    const fetchCategories = useCallback(async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
    }, [supabase]);

    const fetchProductData = useCallback(async () => {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) {
            console.error(error);
            router.push("/admin/products");
            return;
        }
        if (data) {
            setName(data.name);
            setDescription(data.description || "");
            setCategory(data.category);
            setBrand(data.brand || "");
            setImages(data.images || []);
            setPrice(data.price?.toString() || "");
            setStock(data.stock?.toString() || "");
            setOriginalPrice(data.original_price?.toString() || "");
            setHasVariants(data.has_variants || false);
        }
        setLoading(false);
    }, [id, router, supabase]);

    const fetchVariants = useCallback(async () => {
        const { data } = await supabase.from('product_variants').select('*').eq('product_id', id).order('sort_order');
        if (data) {
            setVariants(data);

            // Try to reconstruct variation structure from existing data if possible
            if (data.length > 0) {
                setHasVariants(true);
            }
        }
    }, [id, supabase]);

    useEffect(() => {
        params.then(unwrappedParams => {
            setId(unwrappedParams.id);
        });
        fetchCategories();
    }, [fetchCategories, params]);

    useEffect(() => {
        if (!id) return;
        fetchProductData();
        fetchVariants();
    }, [fetchProductData, fetchVariants, id]);

    // --- Matrix Logic ---
    const addOption = (tier: 1 | 2) => {
        const input = tier === 1 ? variation1Input : variation2Input;
        const setOptions = tier === 1 ? setVariation1Options : setVariation2Options;
        const setInput = tier === 1 ? setVariation1Input : setVariation2Input;

        if (!input.trim()) return;
        setOptions(prev => [...prev, input.trim()]);
        setInput("");
    };

    const removeOption = (tier: 1 | 2, option: string) => {
        const setOptions = tier === 1 ? setVariation1Options : setVariation2Options;
        setOptions(prev => prev.filter(o => o !== option));
    };

    // Generate Matrix Combinations
    const generateMatrix = () => {
        const newVariants: VariantItem[] = [];
        let sortOrder = 0;

        if (variation1Options.length === 0 && variation2Options.length === 0) return;

        // Helper to create variant object
        const createVariant = (label: string, type: string) => ({
            id: `temp-${Date.now()}-${sortOrder}-${Math.random()}`,
            label,
            variant_type: type,
            price: 0,
            stock: 0,
            image_url: null,
            sort_order: sortOrder++,
            is_active: true,
        });

        if (variation1Options.length > 0 && variation2Options.length > 0) {
            // 2 Tiers
            variation1Options.forEach(opt1 => {
                variation2Options.forEach(opt2 => {
                    newVariants.push(createVariant(`${opt1} - ${opt2}`, `${variation1Name} / ${variation2Name}`));
                });
            });
        } else if (variation1Options.length > 0) {
            // 1 Tier
            variation1Options.forEach(opt1 => {
                newVariants.push(createVariant(opt1, variation1Name));
            });
        } else if (variation2Options.length > 0) {
            // 1 Tier (Tier 2 only)
            variation2Options.forEach(opt2 => {
                newVariants.push(createVariant(opt2, variation2Name));
            });
        }

        if (variants.length > 0 && !confirm("This will replace existing variations. Continue?")) return;
        setVariants(newVariants);
    };

    const handleBatchEdit = () => {
        setVariants(prev => prev.map(v => ({
            ...v,
            price: batchPrice ? Number(batchPrice) : v.price,
            stock: batchStock ? Number(batchStock) : v.stock,
        })));
        setBatchPrice("");
        setBatchStock("");
    };

    const updateVariantField = (index: number, field: keyof VariantItem, value: string | number | boolean | null) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    // --- Save Logic ---
    const onSave = async () => {
        setSubmitting(true);
        try {
            // 1. Update Product
            const { error: prodError } = await supabase.from('products').update({
                name,
                description,
                category,
                brand,
                images,
                has_variants: hasVariants,
                original_price: originalPrice ? Number(originalPrice) : null,
                ...(hasVariants ? {} : {
                    price: Number(price),
                    stock: Number(stock),
                    in_stock: Number(stock) > 0,
                }),
            }).eq('id', id);

            if (prodError) throw prodError;

            // 2. Update Variants
            if (hasVariants) {
                const { data: existingDB } = await supabase.from('product_variants').select('id').eq('product_id', id);
                const existingIds = existingDB?.map(v => v.id) || [];
                const uiIds = variants.filter(v => !v.id.startsWith('temp-')).map(v => v.id);

                const toDelete = existingIds.filter(eid => !uiIds.includes(eid));

                if (toDelete.length > 0) {
                    await supabase.from('product_variants').delete().in('id', toDelete);
                }

                for (const v of variants) {
                    const payload = {
                        product_id: id,
                        label: v.label,
                        price: v.price,
                        stock: v.stock,
                        image_url: v.image_url,
                        sort_order: v.sort_order,
                        is_active: v.is_active,
                        variant_type: v.variant_type
                    };

                    if (v.id.startsWith('temp-')) {
                        await supabase.from('product_variants').insert(payload);
                    } else {
                        await supabase.from('product_variants').update(payload).eq('id', v.id);
                    }
                }
            } else {
                const { data: existingDB } = await supabase.from('product_variants').select('id').eq('product_id', id);
                if (existingDB && existingDB.length > 0) {
                    // If user disabled variations, we disable/delete them
                    await supabase.from('product_variants').delete().eq('product_id', id);
                }
            }

            // Sync price/stock/in_stock from variants after saving
            if (hasVariants) {
                const activeVars = variants.filter(v => v.is_active !== false);
                const totalStock = activeVars.reduce((sum, v) => sum + Number(v.stock || 0), 0);
                const minPrice = activeVars.length > 0 ? Math.min(...activeVars.map(v => Number(v.price || 0))) : 0;
                await supabase.from('products').update({
                    price: minPrice,
                    stock: totalStock,
                    in_stock: totalStock > 0,
                }).eq('id', id);
            }

            // Show success notification properly (no alert)
            // Ideally use your toast system, but currently defaulting to alert for simplicity in this file
            // Let's create a custom temporary banner instead of alert if possible, but alert is fine for now as requested by user ("suggestion lang")
            // Actually, I'll add a simple inline success message state
            alert("Product updated successfully!");
            router.refresh();
        } catch (e: unknown) {
            console.error(e);
            alert("Error saving: " + (e instanceof Error ? e.message : "Unknown error"));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center dark:bg-[#121212]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f6f6] dark:bg-[#121212] flex flex-col pb-20">
            {/* Top Bar */}
            <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
                            <div className="text-xs text-gray-400 font-mono hidden md:block">{id}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${hasVariants ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {hasVariants ? 'Variable Product' : 'Simple Product'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar Navigation */}
                <div className="hidden lg:block lg:col-span-2">
                    <div className="sticky top-24 space-y-1">
                        {SECTIONS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id);
                                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all ${activeSection === s.id
                                    ? "bg-white shadow-sm ring-1 ring-gray-200 text-blue-600 dark:bg-[#1a1a1a] dark:ring-gray-700 dark:text-blue-400"
                                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <s.icon className="size-4" />
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-10 space-y-6">

                    {/* Basic Info Section */}
                    <div id="basic-info" className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <FileText className="size-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h2>
                        </div>

                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name *</label>
                                <div className="relative">
                                    <input
                                        maxLength={120}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-gray-900 dark:text-white transition-all outline-none"
                                        placeholder="Product Name"
                                    />
                                    <span className="absolute right-3 top-3 text-xs text-gray-400">{name.length}/120</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brand</label>
                                    <input
                                        value={brand}
                                        onChange={e => setBrand(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Brand Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description *</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-white resize-y outline-none"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sales Info Section */}
                    <div id="sales-info" className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <Tag className="size-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales Information</h2>
                        </div>

                        {/* Toggle Variations */}
                        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 rounded-lg">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable Variations</h3>
                                <p className="text-xs text-gray-500">Turn on if this product has multiple options like sizes or colors.</p>
                            </div>
                        </div>

                        {!hasVariants ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₱) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₱</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={e => setStock(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Variation Builder */}
                                <div className="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-6">
                                    {/* Tier 1 */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Variation 1</label>
                                            <input
                                                value={variation1Name}
                                                onChange={e => setVariation1Name(e.target.value)}
                                                className="text-xs border-b border-gray-300 bg-transparent focus:outline-none text-right text-gray-500 focus:border-blue-500"
                                                placeholder="Name (e.g. Color)"
                                            />
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                value={variation1Input}
                                                onChange={e => setVariation1Input(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption(1))}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Add option and press Enter (e.g. Red)"
                                            />
                                            <button onClick={() => addOption(1)} type="button" className="px-4 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                        {variation1Options.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {variation1Options.map(opt => (
                                                    <span key={opt} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300">
                                                        {opt}
                                                        <button onClick={() => removeOption(1, opt)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tier 2 */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Variation 2 <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                                            <input
                                                value={variation2Name}
                                                onChange={e => setVariation2Name(e.target.value)}
                                                className="text-xs border-b border-gray-300 bg-transparent focus:outline-none text-right text-gray-500 focus:border-blue-500"
                                                placeholder="Name (e.g. Size)"
                                            />
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                value={variation2Input}
                                                onChange={e => setVariation2Input(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption(2))}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Add option and press Enter (e.g. Large)"
                                            />
                                            <button onClick={() => addOption(2)} type="button" className="px-4 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                        {variation2Options.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {variation2Options.map(opt => (
                                                    <span key={opt} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300">
                                                        {opt}
                                                        <button onClick={() => removeOption(2, opt)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={generateMatrix}
                                        className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 hover:text-blue-500"
                                    >
                                        <LayoutGrid className="size-4" />
                                        Update Variation Matrix
                                    </button>
                                </div>

                                {/* Matrix Table */}
                                {variants.length > 0 && (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                        {/* Batch Edit Header */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-wrap gap-4 items-center border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Batch Edit:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1.5 text-xs text-gray-500">₱</span>
                                                    <input
                                                        placeholder="Price"
                                                        value={batchPrice}
                                                        onChange={e => setBatchPrice(e.target.value)}
                                                        className="w-24 pl-5 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <input
                                                    placeholder="Stock"
                                                    value={batchStock}
                                                    onChange={e => setBatchStock(e.target.value)}
                                                    className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleBatchEdit}
                                                    className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
                                                >
                                                    Apply To All
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/30">
                                                    <tr>
                                                        <th className="px-6 py-4 font-semibold">Variant</th>
                                                        <th className="px-6 py-4 font-semibold">Price</th>
                                                        <th className="px-6 py-4 font-semibold">Stock</th>
                                                        <th className="px-6 py-4 font-semibold text-center">Image</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {variants.map((variant, idx) => (
                                                        <tr key={variant.id} className="bg-white border-b dark:bg-[#1a1a1a] dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                                <div className="flex flex-col">
                                                                    <span>{variant.label}</span>
                                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{variant.variant_type}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="relative max-w-[140px]">
                                                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">₱</span>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.price}
                                                                        onChange={e => updateVariantField(idx, 'price', Number(e.target.value))}
                                                                        className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="number"
                                                                    value={variant.stock}
                                                                    onChange={e => updateVariantField(idx, 'stock', Number(e.target.value))}
                                                                    className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {/* Simple Image Placeholder */}
                                                                <div className="flex justify-center">
                                                                    <ImageUpload
                                                                        value={variant.image_url ? [variant.image_url] : []}
                                                                        onChange={(url) => updateVariantField(idx, 'image_url', url)}
                                                                        onRemove={() => updateVariantField(idx, 'image_url', null)}
                                                                        maxImages={1}
                                                                        compact={true}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newVars = [...variants];
                                                                        newVars.splice(idx, 1);
                                                                        setVariants(newVars);
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Media Management */}
                    <div id="media" className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <ImageIcon className="size-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Media Management</h2>
                        </div>
                        <ImageUpload
                            value={images}
                            onChange={(url) => setImages(prev => [...prev, url])}
                            onRemove={(url) => setImages(prev => prev.filter((current) => current !== url))}
                        />
                    </div>

                </div>
            </div>

            {/* Sticky Save Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500 hidden md:block">
                        Unsaved changes will be lost.
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={submitting}
                            className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" /> Saving...
                                </span>
                            ) : "Save & Publish"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
