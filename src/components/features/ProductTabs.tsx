"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Review } from "@/types";
import { useRouter } from "next/navigation";

interface ProductTabsProps {
    productId: string;
    description: string;
    specs?: { label: string; value: string }[];
    reviews?: Review[];
    hasPurchased: boolean;
}

export function ProductTabs({ productId, description, specs = [], reviews = [], hasPurchased }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
    const router = useRouter();

    const handleReviewSubmitted = () => {
        // Refresh the page to show the new review
        router.refresh();
    };

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex items-center gap-8 border-b border-[#282f39] mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("desc")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                        activeTab === "desc" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Description
                </button>
                <button
                    onClick={() => setActiveTab("specs")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                        activeTab === "specs" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Tech Specs
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                        activeTab === "reviews" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Reviews ({reviews.length})
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px] text-gray-400 leading-relaxed">
                {activeTab === "desc" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="whitespace-pre-wrap">{description}</p>
                    </div>
                )}
                {activeTab === "specs" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {specs && specs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {specs.map((spec, i) => (
                                    <div key={i} className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                        <span className="font-medium text-white">{spec.label}</span>
                                        <span>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500 border border-[#282f39] border-dashed rounded-xl bg-[#1c222b]/50">
                                <p>No technical specifications available.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        {hasPurchased ? (
                            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
                        ) : (
                            <div className="text-center py-10 bg-card border border-border rounded-xl">
                                <Star className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-white font-bold mb-2">Want to share your thoughts?</h3>
                                <p className="text-sm">You must purchase this item to write a review. Check your <a href="/profile/purchases" className="text-primary hover:underline">Order History</a>.</p>
                            </div>
                        )}
                        <ReviewsList reviews={reviews} />
                    </div>
                )}
            </div>
        </div>
    );
}

