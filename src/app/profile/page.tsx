"use client";

import { Camera, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State (initially empty, filled after fetch)
    const [fullName, setFullName] = useState("");
    const [gender, setGender] = useState("male");
    const [day, setDay] = useState("1");
    const [month, setMonth] = useState("January");
    const [year, setYear] = useState("2000");

    useEffect(() => {
        async function getUser() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login?next=/profile");
                return;
            }
            setUser(user);

            // Populate form with available metadata
            setFullName(user.user_metadata.full_name || user.user_metadata.name || "");
            setLoading(false);
        }
        getUser();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="size-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Should redirect

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <p className="text-muted-foreground text-sm mt-1">Manage and protect your account</p>
            </div>

            <div className="p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
                {/* Profile Form */}
                <div className="flex-1 max-w-2xl">
                    <form className="space-y-6">
                        {/* Username (Display User ID for now or Username if set) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">User ID</label>
                            <div className="flex-1 text-sm font-medium text-muted-foreground truncate">{user.id}</div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Name</label>
                            <div className="flex-1">
                                <input
                                    className="w-full bg-background border border-input rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Email</label>
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm">{user.email}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Verified</span>
                            </div>
                        </div>

                        {/* Phone (Placeholder for now as Auth usually doesn't have it by default unless configured) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Phone Number</label>
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Not set</span>
                                <button className="text-primary hover:underline text-xs font-medium" type="button">Add</button>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Gender</label>
                            <div className="flex-1 flex items-center gap-6">
                                {["Male", "Female", "Other"].map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option.toLowerCase()}
                                            checked={gender === option.toLowerCase()}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="text-primary focus:ring-primary/20 border-border bg-transparent"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Birthday */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Date of Birth</label>
                            <div className="flex-1 flex gap-3">
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {Array.from({ length: 100 }, (_, i) => 2024 - i).map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                            <div className="sm:w-32"></div>
                            <div className="flex-1">
                                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-10 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98]" type="submit" disabled>
                                    Save Changes (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Avatar Upload */}
                <div className="w-full lg:w-64 flex flex-col items-center gap-6 lg:border-l border-border">
                    <div className="relative group">
                        <div className="size-32 rounded-full overflow-hidden border-4 border-secondary shadow-xl bg-secondary">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {user.user_metadata.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground uppercase">
                                    {user.email?.slice(0, 2)}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white size-8" />
                        </div>
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <div className="bg-secondary/50 px-4 py-2 rounded-lg text-xs font-mono text-muted-foreground break-all">
                            {user.email}
                        </div>
                        <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
                            Provider: {user.app_metadata.provider || 'email'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
