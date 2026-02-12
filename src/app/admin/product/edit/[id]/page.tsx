"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation"; // Use useParams for client component params
import ImageUpload from "@/components/ui/image-upload";

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>("");

    // Resolve params properly for Next.js 15
    useEffect(() => {
        params.then(unwrappedParams => {
            setId(unwrappedParams.id);
        });
    }, [params]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Guitars");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [inStock, setInStock] = useState(true);

    // Fetch Product Data
    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setName(data.name);
                    setDescription(data.description);
                    setPrice(data.price.toString());
                    setCategory(data.category);
                    setBrand(data.brand);
                    setImages(data.images || []);
                    setInStock(data.in_stock);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("Product not found");
                router.push("/admin/products");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase.from('products').update({
                name,
                description,
                price: Number(price),
                category,
                brand,
                images,
                in_stock: inStock
            }).eq('id', id);

            if (error) throw error;

            alert("Product Updated Successfully!");
            router.push("/admin/products");
            router.refresh();

        } catch (error: any) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white">Loading product details...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-[#1f2937] rounded-xl border border-gray-800 shadow-xl">
            <h1 className="text-2xl font-bold mb-6 text-white">Edit Product</h1>

            <form onSubmit={onSubmit} className="space-y-6">

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Product Images</label>
                    <ImageUpload
                        value={images}
                        onChange={(url) => setImages(prev => [...prev, url])}
                        onRemove={(url) => setImages(prev => prev.filter((current) => current !== url))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Product Name</label>
                        <input
                            required
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Brand</label>
                        <input
                            required
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Price (PHP)</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                        <select
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={inStock ? "true" : "false"}
                            onChange={e => setInStock(e.target.value === "true")}
                        >
                            <option value="true">In Stock</option>
                            <option value="false">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                    <select
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="Guitars">Guitars</option>
                        <option value="Keys">Keys</option>
                        <option value="Percussion">Percussion</option>
                        <option value="Studio">Studio</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                    <textarea
                        required
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-white min-h-[120px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
