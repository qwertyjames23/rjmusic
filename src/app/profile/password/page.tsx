"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

export default function ChangePasswordPage() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Change Password</h2>
                <p className="text-muted-foreground text-sm mt-1">Ensure your account is using a long, random password to stay secure.</p>
            </div>

            <div className="p-6 lg:p-10 max-w-2xl">
                <form className="space-y-6">
                    {/* Current Password */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="sm:w-40 text-muted-foreground text-sm sm:text-right font-medium">Current Password</label>
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-background border border-input rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                type={showCurrent ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="sm:w-40 text-muted-foreground text-sm sm:text-right font-medium">New Password</label>
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-background border border-input rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                type={showNew ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="sm:w-40 text-muted-foreground text-sm sm:text-right font-medium">Confirm Password</label>
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-background border border-input rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                type={showConfirm ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="sm:w-40"></div>
                        <div className="flex-1">
                            <a href="#" className="text-primary text-xs font-bold hover:underline">Forgot Password?</a>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                        <div className="sm:w-40"></div>
                        <div className="flex-1">
                            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-10 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center gap-2" type="submit">
                                <Lock className="size-4" /> Change Password
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
