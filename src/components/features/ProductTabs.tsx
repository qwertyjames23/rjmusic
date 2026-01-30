"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
    description: string;
    specs?: { label: string; value: string }[];
}

export function ProductTabs({ description, specs }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex items-center gap-8 border-b border-[#282f39] mb-6">
                <button
                    onClick={() => setActiveTab("desc")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                        activeTab === "desc" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Description
                </button>
                <button
                    onClick={() => setActiveTab("specs")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                        activeTab === "specs" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Tech Specs
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                        activeTab === "reviews" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    )}
                >
                    Reviews
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px] text-gray-400 leading-relaxed">
                {activeTab === "desc" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p>{description}</p>
                        <p className="mt-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-1 ml-4 marker:text-primary">
                            <li>Premium build quality</li>
                            <li>Professional grade components</li>
                            <li>Designed for the modern musician</li>
                        </ul>
                    </div>
                )}
                {activeTab === "specs" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                <span className="font-medium text-white">Weight</span>
                                <span>3.5 kg</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                <span className="font-medium text-white">Dimensions</span>
                                <span>45 x 20 x 10 cm</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                <span className="font-medium text-white">Material</span>
                                <span>Aluminum / Wood</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                <span className="font-medium text-white">Warranty</span>
                                <span>2 Years</span>
                            </div>
                            {specs?.map((spec, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-[#282f39] border-dashed">
                                    <span className="font-medium text-white">{spec.label}</span>
                                    <span>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-10">
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
