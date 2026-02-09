"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Trash2, Loader2, Calendar, Search, MessageSquare, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    products?: {
        name: string;
        images: string[];
    };
    // user details might be missing if relying on auth.users which is restricted
}

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
    const supabase = createClient();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            (review.products?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (review.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (review.comment || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRating = filterRating === 'all' || review.rating === filterRating;

        return matchesSearch && matchesRating;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search product, title, or comment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111827] border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    />
                </div>

                <div className="flex bg-[#111827] rounded-lg border border-gray-600 p-1">
                    <button
                        onClick={() => setFilterRating('all')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                            filterRating === 'all' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        All
                    </button>
                    {[5, 4, 3, 2, 1].map(star => (
                        <button
                            key={star}
                            onClick={() => setFilterRating(star)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                                filterRating === star ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {star} <Star className="size-3 fill-current" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Reviews</p>
                    <p className="text-2xl font-bold text-white mt-1">{reviews.length}</p>
                </div>
                <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Average Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-yellow-400">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                        </span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`size-4 ${i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Most Reviewed</p>
                    <p className="text-lg font-bold text-white mt-1 truncate">
                        {reviews.length > 0 ? "See list below" : "N/A"}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-20 bg-[#1f2937]/50 rounded-xl border border-dashed border-gray-700">
                        <MessageSquare className="size-10 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-300">No reviews found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review.id} className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-sm hover:border-gray-500 transition-colors group relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Product Info */}
                                <div className="md:w-48 shrink-0 flex md:flex-col gap-3 items-center md:items-start border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
                                    <div className="size-16 rounded-lg bg-gray-800 relative overflow-hidden flex-shrink-0 border border-gray-700">
                                        {review.products?.images?.[0] ? (
                                            <Image
                                                src={review.products.images[0]}
                                                alt={review.products.name || "Product"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <MessageSquare className="size-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white leading-tight line-clamp-2" title={review.products?.name}>
                                            {review.products?.name || "Unknown Product"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 font-mono">{review.id.slice(0, 8)}</p>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1 bg-[#111827] px-2 py-1 rounded-md border border-gray-700">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "size-3.5",
                                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2">{review.title}</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col justify-end gap-2 pl-4 md:border-l border-gray-700">
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        disabled={deletingId === review.id}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 md:w-10 md:h-10 disabled:opacity-50"
                                        title="Delete Review"
                                    >
                                        {deletingId === review.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
