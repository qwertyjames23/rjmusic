"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;

        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    message: message.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");

            setTimeout(() => setStatus("idle"), 5000);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[400px]">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="size-6 text-green-500" />
                </div>
                <h3 className="font-bold text-lg">Message Sent!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 h-full">
            <h3 className="font-bold text-lg">Send us a Message</h3>
            <p className="text-sm text-muted-foreground -mt-2">
                Fill out the form and we&apos;ll respond as soon as possible.
            </p>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
                <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    required
                    rows={5}
                    className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none flex-1"
                />
            </div>

            {status === "error" && (
                <p className="text-sm text-red-500">{errorMsg}</p>
            )}

            <button
                type="submit"
                disabled={status === "loading" || !name.trim() || !email.trim() || !message.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Send className="size-4" />
                )}
                {status === "loading" ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}
