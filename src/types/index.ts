export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number; // For sales
    category: "Guitars" | "Keys" | "Percussion" | "Studio" | "Accessories";
    brand: string;
    images: string[];
    inStock: boolean;
    stock?: number; // Added for inventory management
    rating: number;
    reviews: number;
    tags?: ("NEW" | "SALE" | "BESTSELLER")[];
    features?: string[];
    has_variants?: boolean;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    product_id: string;
    label: string;
    price: number;
    stock: number;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
    variant_type?: string | null; // e.g. "Model", "Size", "Color", "Gauge"
}

export interface CartItem extends Product {
    quantity: number;
    selectedVariant?: ProductVariant; // Track which variant was selected
}

export interface Address {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    order_number: string;

    // Shipping address
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;

    // Totals
    subtotal: number;
    shipping_fee: number;
    tax: number;
    total: number;

    // Status
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: 'cod' | 'card' | 'gcash' | 'paymaya';
    payment_status: 'pending' | 'paid' | 'failed';

    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
    } | null;
}
