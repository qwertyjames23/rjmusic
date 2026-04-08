import { supabase } from "./supabase";
import { Product } from "@/types";

export const revalidate = 60; // Revalidate data every 60 seconds

interface DBProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price: number | null;
    category: string;
    brand: string;
    images: string[];
    in_stock: boolean;
    rating: number;
    reviews: number;
    tags: string[];
    features: string[];
    created_at: string;
}

const CATEGORIES: Product["category"][] = ["Guitars", "Keys", "Percussion", "Studio", "Accessories"];
type ProductTag = NonNullable<Product["tags"]>[number];
const PRODUCT_TAGS: ProductTag[] = ["NEW", "SALE", "BESTSELLER"];

function normalizeCategory(value: string): Product["category"] {
    return CATEGORIES.includes(value as Product["category"])
        ? (value as Product["category"])
        : "Accessories";
}

function normalizeTags(tags?: string[] | null): Product["tags"] {
    if (!tags) return [];
    return tags.filter((tag): tag is ProductTag => PRODUCT_TAGS.includes(tag as ProductTag));
}

export async function getProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            // Don't log AbortErrors - they're expected in dev mode
            if (error.message?.includes('aborted')) {
                return [];
            }
            console.error("Error fetching products:", error);
            return [];
        }

        return data.map((item: DBProduct) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            originalPrice: item.original_price ?? undefined,
            category: normalizeCategory(item.category),
            brand: item.brand,
            images: item.images || [],
            inStock: item.in_stock,
            rating: item.rating,
            reviews: item.reviews,
            tags: normalizeTags(item.tags),
            features: item.features || []
        }));
    } catch (err: unknown) {
        // Suppress AbortError in development (React Strict Mode)
        if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
            return [];
        }
        console.error("Error fetching products:", err);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            // Don't log AbortErrors - they're expected in dev mode
            if (error.message?.includes('aborted')) {
                return null;
            }
            console.error(`Error fetching product ${id}:`, error);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            originalPrice: data.original_price ?? undefined,
            category: normalizeCategory(data.category),
            brand: data.brand,
            images: data.images || [],
            inStock: data.in_stock,
            rating: data.rating,
            reviews: data.reviews,
            tags: normalizeTags(data.tags),
            features: data.features || []
        };
    } catch (err: unknown) {
        // Suppress AbortError in development (React Strict Mode)
        if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
            return null;
        }
        console.error(`Error fetching product ${id}:`, err);
        return null;
    }
}

// Fallback static data for development if DB fails or is empty (Optional, but good for stability)
export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Stratocaster Ultra (Mock)",
        description: "Fallback data. Please check Supabase connection.",
        price: 106350.00,
        category: "Guitars",
        brand: "Fender",
        images: ["https://placehold.co/600x400/101822/FFF?text=Fallback"],
        inStock: true,
        rating: 4.9,
        reviews: 0,
        tags: [],
        features: []
    }
];
