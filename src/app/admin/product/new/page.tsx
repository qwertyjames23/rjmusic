"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import { ArrowLeft, Package, DollarSign, Tag, FileText, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminProductForm() {
    const router = useRouter();
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
    const [stock, setStock] = useState("0"); // Stock State

    // Categories State
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const stockNum = Number(stock);

            const { error } = await supabase.from('products').insert({
                name,
                description,
                price: Number(price),
                original_price: originalPrice ? Number(originalPrice) : null,
                category,
                brand,
                images,
                stock: stockNum,
                in_stock: stockNum > 0, // Auto-set based on stock
                rating: 0,
                reviews: 0
            });

            if (error) throw error;

            // Success notification
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            successDiv.innerHTML = '✓ Product created successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

            // Reset form
            setName("");
            setDescription("");
            setPrice("");
            setOriginalPrice("");
            setImages([]);
            setBrand("");
            setCategory("");
            setStock("0");

            // Redirect to products page
            setTimeout(() => router.push('/admin/products'), 1500);

        } catch (error: any) {
            console.error(error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-4 duration-300';
            errorDiv.innerHTML = '✗ Error: ' + error.message;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-3xl font-bold text-white">Add New Product</h1>
                            <p className="text-gray-400 mt-1">Create a new product listing for your store</p>
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
                            onChange={(url) => setImages([...images, url])}
                            onRemove={(url) => setImages(images.filter((current) => current !== url))}
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
                                        required
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
                                    Status will automatically allow 'Out of Stock' if 0.
                                </p>
                            </div>
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
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Creating Product...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-5 group-hover:rotate-12 transition-transform" />
                                    Create Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
