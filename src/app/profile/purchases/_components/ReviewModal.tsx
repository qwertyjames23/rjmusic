"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner"; // Assuming sonner or just use simple alert for now if no toast lib installed. logic is standard.
import Image from "next/image";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        image: string;
    };
    orderId: string;
    onReviewSubmitted: () => void;
}

export function ReviewModal({ isOpen, onClose, product, orderId, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
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
                .insert([
                    {
                        user_id: user.id,
                        product_id: product.id,
                        order_id: orderId,
                        rating: rating,
                        comment: comment,
                    }
                ]);

            if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                    throw new Error("You have already reviewed this product for this order.");
                }
                throw insertError;
            }

            onReviewSubmitted();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                        {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-800" />
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-lg text-white">{product.name}</h3>
                        <p className="text-gray-400 text-sm">How was your purchase?</p>
                    </div>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${(hoverRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-gray-600"
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review here... (optional)"
                        className="w-full h-32 bg-secondary/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
