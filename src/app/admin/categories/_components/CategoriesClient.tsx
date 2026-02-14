"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Search, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    created_at: string;
}

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [formData, setFormData] = useState({ name: "", description: "", image_url: "" });
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            image_url: category.image_url || ""
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "", image_url: "" });
        setIsModalOpen(true);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setIsSaving(true);

        try {
            const slug = generateSlug(formData.name);
            const dataToSave = {
                name: formData.name,
                slug: slug,
                description: formData.description,
                image_url: formData.image_url
            };

            if (editingCategory) {
                // Update
                const { data, error } = await supabase
                    .from('categories')
                    .update(dataToSave)
                    .eq('id', editingCategory.id)
                    .select()
                    .single();

                if (error) throw error;
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? data : c));
            } else {
                // Check if slug exists to avoid error? Or just let DB fail.
                // Create
                const { data, error } = await supabase
                    .from('categories')
                    .insert(dataToSave)
                    .select()
                    .single();

                if (error) throw error;
                setCategories(prev => [data, ...prev]);
            }
            setIsModalOpen(false);
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            alert(`Error saving category: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        setIsDeleting(id);

        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            alert(`Error deleting category: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1f2937] p-4 rounded-xl border border-gray-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111827] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map(category => (
                    <div key={category.id} className="bg-[#1f2937] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-[#111827] border border-gray-700 flex items-center justify-center overflow-hidden">
                                    {category.image_url ? (
                                        <Image src={category.image_url} alt={category.name} width={48} height={48} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-gray-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-lg truncate">{category.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono truncate">/{category.slug}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    disabled={!!isDeleting}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    {isDeleting === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] relative z-10">
                            {category.description || "No description"}
                        </p>

                        {/* Background Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-xl bg-[#1f2937]/30">
                        <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
                        <p>No categories found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1f2937] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 relative m-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            {editingCategory ? <Pencil className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                            {editingCategory ? 'Edit Category' : 'New Category'}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-600"
                                    placeholder="e.g. Electric Guitars"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none placeholder-gray-600"
                                    placeholder="Brief description of the category..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-600"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.image_url && (
                                    <div className="mt-2 h-20 w-full rounded-lg overflow-hidden bg-black/20 border border-gray-700">
                                        <Image src={formData.image_url} alt="Preview" width={320} height={80} className="h-full w-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving || !formData.name}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
