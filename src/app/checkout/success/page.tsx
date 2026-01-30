"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {

    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto px-4 min-h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="size-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                <CheckCircle2 className="size-12 text-green-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Thank you for your purchase. We've sent a confirmation email with your order details.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/products"
                    className="h-12 px-8 rounded-lg bg-secondary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/profile"
                    className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    View Order
                    <ArrowRight className="size-4" />
                </Link>
            </div>
        </div>
    );
}
