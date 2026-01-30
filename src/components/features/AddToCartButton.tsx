"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    product: Product;
    className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={cn(
                "flex-1 h-12 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2",
                product.inStock
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                className
            )}
        >
            {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>
    );
}
