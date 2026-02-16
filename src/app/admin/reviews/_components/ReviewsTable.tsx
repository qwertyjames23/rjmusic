"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Star } from "lucide-react";
import Image from "next/image";

interface ReviewRow {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string; // Add user_name
    product?: {
        name?: string;
        images?: string[];
    } | null;
}

export function ReviewsTable({ initialReviews }: { initialReviews: ReviewRow[] }) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        setDeletingId(id);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("id", id);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                        <tr>
                            <th className="p-4">Product</th><th className="p-4">Customer</th><th className="p-4">Rating</th><th className="p-4 w-1/2">Comment</th><th className="p-4">Date</th><th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialReviews.map((review) => (
                            <tr key={review.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-10 bg-white/5 rounded overflow-hidden shrink-0">
                                            {review.product?.images?.[0] ? (
                                                <Image src={review.product.images[0]} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800" />
                                            )}
                                        </div>
                                        <span className="font-medium text-white line-clamp-1">{review.product?.name || "Unknown Product"}</span>
                                    </div>
                                </td><td className="p-4 text-white font-medium">{review.user_name}</td><td className="p-4">
                                    <div className="flex text-yellow-500">
                                        {Array.from({ length: review.rating }).map((_, i) => (
                                            <Star key={i} className="size-3 fill-current" />
                                        ))}
                                    </div>
                                </td><td className="p-4 text-gray-300 italic">&ldquo;{review.comment}&rdquo;</td><td className="p-4 text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</td><td className="p-4">
                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        disabled={deletingId === review.id}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === review.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {initialReviews.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">No reviews found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
