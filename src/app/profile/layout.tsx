"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, FileText, Bell, Ticket, Edit, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const isAccountActive = pathname.startsWith("/profile") && !pathname.startsWith("/profile/purchases") && !pathname.startsWith("/profile/notifications") && !pathname.startsWith("/profile/vouchers");

    return (
        <div className="container mx-auto px-4 py-8 lg:px-20 lg:py-12 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0 space-y-6">

                {/* Profile Card */}
                <div className="flex items-center gap-3 px-2">
                    <div className="size-12 rounded-full bg-secondary bg-center bg-cover border-2 border-primary/30 shrink-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate text-foreground">Alex Rivera</p>
                        <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                            <Edit className="size-3" /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">

                    {/* My Account Section */}
                    <div className="mb-1">
                        <button
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors font-medium",
                                isAccountActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <User className={cn("size-5", isAccountActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm">My Account</span>
                        </button>

                        {/* Submenu */}
                        <div className="flex flex-col gap-1 mt-1 pl-12">
                            <Link
                                href="/profile"
                                className={cn(
                                    "text-sm py-1 transition-colors block",
                                    isActive("/profile") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                                )}
                            >
                                Profile
                            </Link>
                            <Link
                                href="/profile/addresses"
                                className={cn(
                                    "text-sm py-1 transition-colors block",
                                    isActive("/profile/addresses") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                                )}
                            >
                                Addresses
                            </Link>
                            <Link
                                href="/profile/password"
                                className={cn(
                                    "text-sm py-1 transition-colors block",
                                    isActive("/profile/password") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                                )}
                            >
                                Change Password
                            </Link>
                        </div>
                    </div>

                    <Link
                        href="/profile/purchases"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            isActive("/profile/purchases")
                                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
                        )}
                    >
                        <FileText className="size-5" />
                        <span className="text-sm">My Purchase</span>
                    </Link>

                    <Link
                        href="/profile/notifications"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            isActive("/profile/notifications")
                                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
                        )}
                    >
                        <Bell className="size-5" />
                        <span className="text-sm">Notifications</span>
                    </Link>

                    <Link
                        href="/profile/vouchers"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            isActive("/profile/vouchers")
                                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
                        )}
                    >
                        <Ticket className="size-5" />
                        <span className="text-sm">Vouchers</span>
                    </Link>

                    <div className="border-t border-border my-2 pt-2">
                        <Link
                            href="#"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        >
                            <LogOut className="size-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
