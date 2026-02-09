import { createClient } from "@/utils/supabase/server";
import { ReviewsTable } from "./_components/ReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
    const supabase = await createClient();
    
    // Fetch reviews
    const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return <div className="p-8 text-red-500">Error loading reviews.</div>;
    }

    // Fetch associated products manually since we don't have a direct FK relation set up in all SQL versions
    const productIds = Array.from(new Set(reviews?.map(r => r.product_id) || []));
    const { data: products } = await supabase.from("products").select("id, name, images").in("id", productIds);

    const reviewsWithProducts = reviews?.map(r => ({
        ...r,
        product: products?.find(p => p.id === r.product_id)
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                <p className="text-gray-400">Moderate user reviews and ratings.</p>
            </div>
            <ReviewsTable initialReviews={reviewsWithProducts || []} />
        </div>
    );
}