"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarRating } from '@/components/ui/StarRating';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

type ReviewFormInputs = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 }
  });

  const onSubmit: SubmitHandler<ReviewFormInputs> = async (data) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to submit a review.");
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      onReviewSubmitted();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review. You may have already reviewed this product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-lg">
      <h3 className="text-xl font-bold">Write a Review</h3>
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <StarRating rating={0} onRatingChange={(rating) => setValue('rating', rating, { shouldValidate: true })} isEditable />
        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">Review Title</label>
        <input id="title" {...register('title')} className="w-full bg-input rounded-md p-2" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Review</label>
        <textarea id="comment" {...register('comment')} rows={4} className="w-full bg-input rounded-md p-2" />
        {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md flex items-center justify-center">
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
      </button>
    </form>
  );
}
