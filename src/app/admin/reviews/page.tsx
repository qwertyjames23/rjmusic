import { createClient } from "@/utils/supabase/server";
import ReviewsClient from "./_components/ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            *,
            products (name, images)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="p-8 text-red-500">
                Failed to load reviews. Error: {error.message}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-white tracking-tight">Reviews</h1>
                <p className="text-gray-400 mt-1">Manage customer reviews and ratings.</p>
            </div>

            <ReviewsClient initialReviews={reviews || []} />
        </div>
    );
}
