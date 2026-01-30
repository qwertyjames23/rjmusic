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
    rating: number;
    reviews: number;
    tags?: ("NEW" | "SALE" | "BESTSELLER")[];
    features?: string[];
}

export interface CartItem extends Product {
    quantity: number;
}
