"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload"; // We created this

export default function AdminProductForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Guitars");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('products').insert({
                name,
                description,
                price: Number(price),
                category,
                brand,
                images,
                in_stock: true,
                rating: 0,
                reviews: 0
            });

            if (error) throw error;

            alert("Product Created!");
            router.refresh();
            // Reset form
            setName(""); setDescription(""); setPrice(""); setImages([]);

        } catch (error: any) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-[#0f141a] rounded-xl border border-white/10">
            <h1 className="text-2xl font-bold mb-6 text-white">Add New Product</h1>

            <form onSubmit={onSubmit} className="space-y-6">

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Product Images</label>
                    <ImageUpload
                        value={images}
                        onChange={(url) => setImages([...images, url])}
                        onRemove={(url) => setImages(images.filter((current) => current !== url))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Product Name</label>
                        <input
                            required
                            className="w-full bg-[#1c222b] border border-white/10 rounded-md p-2 text-white"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Fender Stratocaster"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Brand</label>
                        <input
                            required
                            className="w-full bg-[#1c222b] border border-white/10 rounded-md p-2 text-white"
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                            placeholder="e.g. Fender"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Price (PHP)</label>
                    <input
                        type="number"
                        required
                        className="w-full bg-[#1c222b] border border-white/10 rounded-md p-2 text-white"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                    <select
                        className="w-full bg-[#1c222b] border border-white/10 rounded-md p-2 text-white"
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
                        className="w-full bg-[#1c222b] border border-white/10 rounded-md p-2 text-white min-h-[100px]"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Product detailed description..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Product"}
                </button>
            </form>
        </div>
    );
}
