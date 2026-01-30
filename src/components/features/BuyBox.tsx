"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyBoxProps {
    product: Product;
}

export function BuyBox({ product }: BuyBoxProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedFinish, setSelectedFinish] = useState<string>("default");

    const handleAddToCart = () => {
        addToCart(product, quantity);
        // Optional toast
    };

    return (
        <div className="bg-[#1c222b] rounded-2xl p-6 border border-[#282f39] shadow-xl">
            {/* Stock Status */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full animate-pulse", product.inStock ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-xs font-bold uppercase tracking-wide", product.inStock ? "text-green-500" : "text-red-500")}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Free shipping worldwide</span>
            </div>

            {/* Finish Selector */}
            <div className="mb-8">
                <span className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">Finish</span>
                <div className="flex gap-3">
                    <button
                        onClick={() => setSelectedFinish("default")}
                        className={cn(
                            "size-10 rounded-full border-2 transition-all relative",
                            selectedFinish === "default" ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-[#1c222b]" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        title="Black"
                    >
                        <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#2a2a2a] to-black" />
                    </button>
                    <button
                        onClick={() => setSelectedFinish("white")}
                        className={cn(
                            "size-10 rounded-full border-2 transition-all relative",
                            selectedFinish === "white" ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-[#1c222b]" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        title="Silver"
                    >
                        <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#a0a0a0]" />
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    {/* Quantity */}
                    <div className="flex items-center bg-[#13171d] rounded-lg border border-[#282f39] h-12 px-2 shrink-0">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || !product.inStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white font-mono">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={!product.inStock}
                            className="size-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    {/* Add To Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className={cn(
                            "flex-1 h-12 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                            product.inStock
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {product.inStock ? (
                            <>
                                Add to Cart
                                <ArrowRight className="size-4" />
                            </>
                        ) : "Out of Stock"}
                    </button>
                </div>

                <button className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 py-1 group w-full">
                    <span className="border-b border-transparent group-hover:border-white/50 transition-colors">Add to Wishlist</span>
                </button>
            </div>
        </div>
    );
}

