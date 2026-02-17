"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Trash2, Download, Mail, Users, UserMinus } from "lucide-react";

interface Subscriber {
    id: string;
    email: string;
    status: "active" | "unsubscribed";
    subscribed_at: string;
    unsubscribed_at: string | null;
}

export function NewsletterTable() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter");
            const data = await res.json();
            if (data.subscribers) {
                setSubscribers(data.subscribers);
            }
        } catch (err) {
            console.error("Failed to fetch subscribers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this subscriber?")) return;

        try {
            await fetch("/api/newsletter", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            setSubscribers((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleExportCSV = () => {
        const filtered = getFiltered();
        const csv = [
            "Email,Status,Subscribed At",
            ...filtered.map((s) =>
                `${s.email},${s.status},${new Date(s.subscribed_at).toLocaleDateString()}`
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getFiltered = () => {
        if (filter === "all") return subscribers;
        return subscribers.filter((s) => s.status === filter);
    };

    const filtered = getFiltered();
    const activeCount = subscribers.filter((s) => s.status === "active").length;
    const unsubCount = subscribers.filter((s) => s.status === "unsubscribed").length;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0f141a] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Mail className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{subscribers.length}</p>
                            <p className="text-xs text-gray-500">Total Subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0f141a] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Users className="size-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{activeCount}</p>
                            <p className="text-xs text-gray-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0f141a] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <UserMinus className="size-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{unsubCount}</p>
                            <p className="text-xs text-gray-500">Unsubscribed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(["all", "active", "unsubscribed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                filter === f
                                    ? "bg-blue-600 text-white"
                                    : "bg-[#1f2937] text-gray-400 hover:text-white"
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={filtered.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1f2937] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Download className="size-3.5" />
                    Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#0f141a] border border-white/5 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-5 animate-spin text-gray-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Mail className="size-8 text-gray-600 mb-3" />
                        <p className="text-gray-400 text-sm">No subscribers yet</p>
                        <p className="text-gray-500 text-xs mt-1">Subscribers will appear here when people sign up via the footer</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Subscribed</th>
                                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((sub) => (
                                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-white">{sub.email}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            sub.status === "active"
                                                ? "bg-green-500/10 text-green-400"
                                                : "bg-red-500/10 text-red-400"
                                        }`}>
                                            {sub.status === "active" ? "Active" : "Unsubscribed"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-gray-400">{formatDate(sub.subscribed_at)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            title="Remove subscriber"
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
