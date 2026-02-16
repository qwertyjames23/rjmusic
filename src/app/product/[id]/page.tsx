import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductPriceDisplay } from "./ProductPriceDisplay";
import { ProductTabs } from "@/components/features/ProductTabs";
import { ProductCard } from "@/components/features/ProductCard";
import { supabase } from "@/lib/supabase";
import { Product, ProductVariant, Review } from "@/types";

export const dynamic = "force-dynamic";

interface ProductVariantRow {
    id: string;
    product_id: string;
    label: string;
    price: number | string;
    stock: number | string;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
    variant_type?: string | null;
}

interface ProductRow {
    id: string;
    name: string;
    description: string;
    price: number | string;
    original_price?: number | string | null;
    category: Product["category"];
    brand: string;
    images?: string[] | null;
    in_stock: boolean;
    stock?: number;
    rating: number | string;
    reviews: number | string;
    tags?: Product["tags"];
    features?: string[];
}

// Helper to fetch single product with variants
async function getProduct(id: string): Promise<Product | null> {
    // Validate UUID format to prevent database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        console.warn(`Invalid UUID format for product ID: ${id}`);
        return null;
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Standard 404, no error log needed

        console.error(`Error fetching product [${id}]:`, error);
        if (Object.keys(error).length === 0) {
            console.error("Empty error object details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        }
        return null;
    }

    if (!data) {
        console.error(`Product not found [${id}]`);
        return null;
    }

    // Fetch variants
    let variants: ProductVariant[] = [];
    if (data.has_variants) {
        const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (!variantError && variantData) {
            variants = (variantData as ProductVariantRow[]).map((v) => ({
                id: v.id,
                product_id: v.product_id,
                label: v.label,
                price: Number(v.price),
                stock: Number(v.stock),
                image_url: v.image_url,
                sort_order: v.sort_order,
                is_active: v.is_active,
                variant_type: v.variant_type || null,
            }));
        }
    }

    // Map to Product Type
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.original_price ? Number(data.original_price) : undefined,
        category: data.category,
        brand: data.brand,
        images: data.images || [],
        inStock: data.in_stock,
        stock: data.stock,
        rating: Number(data.rating),
        reviews: Number(data.reviews),
        tags: data.tags || [],
        features: data.features || [],
        has_variants: data.has_variants || false,
        variants: variants,
    };
}

// Helper to fetch recommendations
async function getRecommendations(currentId: string, category: string): Promise<Product[]> {
    const { data } = await supabase
        .from('products')
        .select('*')
        .neq('id', currentId)
        .eq('category', category)
        .limit(4);

    // Fallback if no category matches
    if (!data || data.length === 0) {
        const { data: fallbackData } = await supabase.from('products').select('*').neq('id', currentId).limit(4);
        if (!fallbackData) return [];
        return (fallbackData as ProductRow[]).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            category: p.category,
            brand: p.brand,
            images: p.images || [],
            inStock: p.in_stock,
            rating: Number(p.rating),
            reviews: Number(p.reviews),
            tags: p.tags || [],
            features: p.features || []
        }));
    }

    return (data as ProductRow[]).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        category: p.category,
        brand: p.brand,
        images: p.images || [],
        inStock: p.in_stock,
        rating: Number(p.rating),
        reviews: Number(p.reviews),
        tags: p.tags || [],
        features: p.features || []
    }));
}

// Helper to fetch reviews with profiles
async function getReviews(productId: string): Promise<Review[]> {
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }

    if (!reviews || reviews.length === 0) return [];

    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

    const profileMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile])
    );

    return reviews.map((review) => {
        const profile = profileMap.get(review.user_id);
        return {
            id: review.id,
            user_id: review.user_id,
            product_id: review.product_id,
            rating: Number(review.rating),
            title: review.title || "",
            comment: review.comment || "",
            created_at: review.created_at,
            profiles: profile
                ? {
                    full_name: profile.full_name || "Verified Customer",
                    avatar_url: profile.avatar_url || undefined,
                }
                : null,
        };
    });
}

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const recommendations = await getRecommendations(product.id, product.category);
    const reviews = await getReviews(product.id);

    // Check if the current user has purchased this item
    const { data: { user } } = await supabase.auth.getUser();
    let hasPurchased = false;
    if (user) {
        const { data } = await supabase.rpc('has_purchased', {
            p_user_id: user.id,
            p_product_id: product.id,
        });
        hasPurchased = !!data;
    }

    // Calculate real rating if available
    const realRating = reviews.length > 0
        ? reviews.reduce((acc: number, r) => acc + r.rating, 0) / reviews.length
        : product.rating;

    const realReviewCount = reviews.length > 0 ? reviews.length : 0;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="capitalize">{product.category}</span>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Images + Tabs (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {/* Client component handles gallery + variant image switching */}
                    <ProductDetailClient
                        product={product}
                    />

                    {/* Tabs Section (Desktop) */}
                    <div className="mt-8 hidden lg:block">
                        <ProductTabs
                            productId={product.id}
                            description={product.description}
                            reviews={reviews}
                            hasPurchased={hasPurchased}
                        />
                    </div>
                </div>

                {/* Right Column: Info & Buy Box (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-8">

                    {/* Header Info */}
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`size-4 ${i < Math.round(realRating) ? 'fill-current' : 'text-gray-600 fill-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground hover:text-white cursor-pointer transition-colors">
                                {realRating.toFixed(1)} ({realReviewCount} reviews)
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                            {product.name}
                        </h1>

                        <ProductPriceDisplay product={product} />
                    </div>

                    {/* Short Description */}
                    <div className="text-gray-400 leading-relaxed text-sm border-t border-b border-[#282f39] py-6">
                        <p>
                            {product.description.substring(0, 150)}{product.description.length > 150 ? "..." : ""}
                        </p>
                    </div>

                    {/* Buy Box Component */}
                    <BuyBoxWrapper product={product} />

                    {/* Mobile Tabs */}
                    <div className="lg:hidden mt-8">
                        <ProductTabs
                            productId={product.id}
                            description={product.description}
                            reviews={reviews}
                            hasPurchased={hasPurchased}
                        />
                    </div>
                </div>
            </div>

            {/* Recommendations Row */}
            <div className="mt-20 pt-10 border-t border-[#282f39]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">You might also like</h2>
                    <Link href="/" className="text-primary text-sm font-bold hover:underline">View all</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map((relatedProduct) => (
                        <ProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Wrapper to import BuyBox (client component) in server component
function BuyBoxWrapper({ product }: { product: Product }) {
    // This is a server component wrapper — the actual BuyBox is imported in ProductDetailClient
    // We keep a simple version here for the right column
    return <BuyBoxClient product={product} />;
}

// Dynamic import of client-side BuyBox
import { BuyBox as BuyBoxClient } from "@/components/features/BuyBox";

