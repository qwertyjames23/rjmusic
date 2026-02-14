"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, User } from "lucide-react";
import Image from "next/image";

export interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
    } | null;
}

interface ProductTabsProps {
    description: string;
    specs?: { label: string; value: string }[];
    reviews?: Review[];
}

export function ProductTabs({ description, specs = [], reviews = [] }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 bg-[#1c222b]/50 rounded-xl border border-[#282f39] border-dashed">
                                <div className="flex justify-center mb-4">
                                    <Star className="w-10 h-10 text-gray-600" />
                                </div>
                                <h3 className="text-white font-bold mb-2">No reviews yet</h3>
                                <p className="text-sm">Purchased this item? Go to <a href="/profile/purchases" className="text-primary hover:underline">My Purchases</a> to write a review.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-primary-foreground/80">
                                        Verified purchases only. To write a review, visit your <a href="/profile/purchases" className="font-bold underline hover:text-primary">Order History</a>.
                                    </p>
                                </div>
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-[#1c222b] p-6 rounded-xl border border-[#282f39]">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {review.profiles?.avatar_url ? (
                                                        <Image src={review.profiles.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">
                                                        {review.profiles?.full_name || "Verified Customer"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "w-4 h-4",
                                                            i < review.rating ? "fill-current" : "text-gray-700 fill-gray-700"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">
                                            {review.comment || <span className="italic text-gray-600">No comment provided.</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
