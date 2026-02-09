"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        image: string;
    } | null;
    orderId: string;
    onReviewSubmitted: () => void;
}

export function ReviewModal({ isOpen, onClose, product, orderId, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Not authenticated");

            const { error: insertError } = await supabase
                .from("reviews")
                .insert({
                    user_id: user.id,
                    product_id: product.id,
                    order_id: orderId,
                    rating,
                    comment,
                });

            if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                     throw new Error("You have already reviewed this item.");
                }
                throw insertError;
            }

            onReviewSubmitted();
            // Reset form
            setRating(0);
            setComment("");
        } catch (err: any) {
            console.error("Error submitting review:", err);
            setError(err.message || "Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-lg">Write a Review</h3>
                    <button 
                        onClick={onClose} 
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex items-center gap-4 border-b border-border bg-muted/10">
                    <div className="relative size-16 bg-secondary rounded-md overflow-hidden shrink-0 border border-border">
                         {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                         ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                         )}
                    </div>
                    <div>
                        <p className="font-bold text-sm line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Order #{orderId.slice(0, 8)}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Rate this product</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`size-8 transition-all ${
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-500 text-yellow-500 drop-shadow-sm"
                                                : "text-muted-foreground/30"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-medium h-5 text-primary">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium">Review (Optional)</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full min-h-[120px] p-3 rounded-lg bg-secondary/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors font-medium text-sm"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}