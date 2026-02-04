"use client";

import { Camera, Loader2, Check, AlertCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { updateProfile } from "./actions";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [day, setDay] = useState("1");
    const [month, setMonth] = useState("1");
    const [year, setYear] = useState("2000");

    // Track if form has changes
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        async function getUser() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login?next=/profile");
                return;
            }
            setUser(user);

            // Populate form with available metadata
            const meta = user.user_metadata;
            setFullName(meta.full_name || meta.name || "");
            setPhone(meta.phone || "");
            setGender(meta.gender || "");

            // Parse birth date if available
            if (meta.birth_date) {
                const date = new Date(meta.birth_date);
                if (!isNaN(date.getTime())) {
                    setDay(date.getDate().toString());
                    setMonth((date.getMonth() + 1).toString());
                    setYear(date.getFullYear().toString());
                }
            }

            setLoading(false);
        }
        getUser();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const formData = new FormData();
        formData.set('fullName', fullName);
        formData.set('phone', phone);
        formData.set('gender', gender);

        // Construct birth date
        const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        formData.set('birthDate', birthDate);

        startTransition(async () => {
            const result = await updateProfile(formData);

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setHasChanges(false);

                // Refresh user data
                const { data: { user: updatedUser } } = await supabase.auth.getUser();
                if (updatedUser) setUser(updatedUser);

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            }
        });
    };

    const handleChange = () => {
        setHasChanges(true);
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="size-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <p className="text-muted-foreground text-sm mt-1">Manage and protect your account</p>
            </div>

            <div className="p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
                {/* Profile Form */}
                <div className="flex-1 max-w-2xl">
                    {/* Status Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success' ? (
                                <Check className="size-5 shrink-0" />
                            ) : (
                                <AlertCircle className="size-5 shrink-0" />
                            )}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User ID (Read-only) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">User ID</label>
                            <div className="flex-1 text-sm font-mono text-muted-foreground truncate bg-secondary/30 px-3 py-2 rounded-lg">
                                {user.id.slice(0, 8)}...{user.id.slice(-8)}
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Full Name</label>
                            <div className="flex-1">
                                <input
                                    className="w-full bg-background border border-input rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => { setFullName(e.target.value); handleChange(); }}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Email</label>
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm">{user.email}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Verified</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Phone</label>
                            <div className="flex-1">
                                <input
                                    className="w-full bg-background border border-input rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); handleChange(); }}
                                    placeholder="+63 9XX XXX XXXX"
                                />
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
                                            onChange={(e) => { setGender(e.target.value); handleChange(); }}
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
                                    aria-label="Birth month"
                                    value={month}
                                    onChange={(e) => { setMonth(e.target.value); handleChange(); }}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    aria-label="Birth day"
                                    value={day}
                                    onChange={(e) => { setDay(e.target.value); handleChange(); }}
                                    className="w-20 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    aria-label="Birth year"
                                    value={year}
                                    onChange={(e) => { setYear(e.target.value); handleChange(); }}
                                    className="w-24 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
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
                            <div className="flex-1 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isPending || !hasChanges}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-10 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary flex items-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                                {hasChanges && (
                                    <span className="text-xs text-muted-foreground animate-pulse">
                                        You have unsaved changes
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Avatar Section */}
                <div className="w-full lg:w-64 flex flex-col items-center gap-6 lg:border-l border-border lg:pl-10">
                    <div className="relative group">
                        <div className="size-32 rounded-full overflow-hidden border-4 border-secondary shadow-xl bg-secondary">
                            {user.user_metadata.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground uppercase bg-gradient-to-br from-primary/20 to-blue-500/20">
                                    {fullName ? fullName.slice(0, 2) : user.email?.slice(0, 2)}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white size-8" />
                        </div>
                    </div>
                    <div className="text-center flex flex-col gap-3">
                        <p className="font-semibold text-lg">{fullName || 'Set your name'}</p>
                        <div className="bg-secondary/50 px-4 py-2 rounded-lg text-xs font-mono text-muted-foreground">
                            {user.email}
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Signed in via <span className="capitalize font-medium text-foreground">{user.app_metadata.provider || 'email'}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
