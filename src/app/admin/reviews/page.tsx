import { createClient } from "@/utils/supabase/server";
import { ReviewsTable } from "./_components/ReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
    const supabase = await createClient();
    
    // Step 1: Fetch all reviews
    const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        return <div className="p-8 text-red-500">Error loading reviews.</div>;
    }

    if (!reviews || reviews.length === 0) {
        // Render the page with an empty table if there are no reviews
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                    <p className="text-gray-400">Moderate user reviews and ratings.</p>
                </div>
                <ReviewsTable initialReviews={[]} />
            </div>
        );
    }

    // Step 2: Get unique user IDs from reviews
    const userIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
    
    // Step 3: Fetch corresponding profiles
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

    if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        // Continue without names if profiles fail to load
    }
    
    // Step 4: Create a map of user IDs to full names for easy lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

    // Step 5: Fetch associated products
    const productIds = Array.from(new Set(reviews.map(r => r.product_id)));
    const { data: products } = await supabase.from("products").select("id, name, images").in("id", productIds);

    // Step 6: Merge all data together
    const reviewsWithDetails = reviews.map(r => ({
        ...r,
        product: products?.find(p => p.id === r.product_id),
        user_name: profileMap.get(r.user_id) || "Anonymous",
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                <p className="text-gray-400">Moderate user reviews and ratings.</p>
            </div>
            <ReviewsTable initialReviews={reviewsWithDetails || []} />
        </div>
    );
}