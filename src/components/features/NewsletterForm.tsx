"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || status === "loading") return;

        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                setMessage(data.error || "Something went wrong");
                return;
            }

            setStatus("success");
            setMessage(data.message);
            setEmail("");

            setTimeout(() => {
                setStatus("idle");
                setMessage("");
            }, 5000);
        } catch {
            setStatus("error");
            setMessage("Failed to subscribe. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h4 className="font-bold mb-2">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
                Get updates on new products and exclusive deals.
            </p>
            {status === "success" ? (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle className="size-4" />
                    <span>{message}</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                        }}
                        placeholder="Enter your email"
                        required
                        className="flex-1 min-w-0 bg-background text-foreground text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-primary placeholder-muted-foreground transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!email.trim() || status === "loading"}
                        className="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {status === "loading" ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="size-3.5" />
                                <span className="hidden sm:inline">Subscribe</span>
                            </>
                        )}
                    </button>
                </form>
            )}
            {status === "error" && (
                <p className="text-red-500 text-xs">{message}</p>
            )}
        </div>
    );
}
