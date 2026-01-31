"use client";

import Link from "next/link";
import { CheckCircle2, Package, Truck, MapPin, Calendar, CreditCard, ArrowRight, ShoppingBag, Mail, Check } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen bg-background relative overflow-x-hidden font-sans text-foreground">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <main className="flex-grow w-full mx-auto p-4 lg:p-8 flex items-center justify-center relative min-h-[calc(100vh-80px)]">
                <div className="max-w-3xl w-full relative z-10">
                    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-12 shadow-2xl text-center">

                        {/* Checkmark Animation */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-700"></div>
                                <div className="relative bg-card rounded-full p-2">
                                    <CheckCircle2 className="size-[80px] text-green-500 fill-green-500/10" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Thank You for Your Purchase!</h1>
                        <p className="text-muted-foreground text-lg mb-10">
                            Your order <span className="font-mono font-bold bg-secondary px-2 py-0.5 rounded border border-border">#RJ-88291</span> has been placed successfully.
                        </p>

                        {/* Order Timeline */}
                        <div className="mb-12 relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0 hidden sm:block"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-0 relative z-10">
                                {/* Step 1: Placed */}
                                <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                                    <div className="size-8 rounded-full bg-green-500 flex items-center justify-center text-primary-foreground shadow-[0_0_10px_rgba(34,197,94,0.4)] flex-shrink-0">
                                        <Check className="size-5" />
                                    </div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-sm font-bold">Order Placed</p>
                                        <p className="text-xs text-muted-foreground">Oct 24, 2:30 PM</p>
                                    </div>
                                </div>

                                {/* Step 2: Processing */}
                                <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                                    <div className="relative flex items-center justify-center size-8 flex-shrink-0">
                                        <span className="absolute w-full h-full rounded-full bg-primary/30 animate-ping"></span>
                                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(19,109,236,0.5)] relative z-10">
                                            <Package className="size-4 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-sm font-bold text-primary">Processing</p>
                                        <p className="text-xs text-muted-foreground">In Progress</p>
                                    </div>
                                </div>

                                {/* Step 3: Shipping */}
                                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 opacity-50">
                                    <div className="size-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                                        <span className="text-xs font-bold">3</span>
                                    </div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-sm font-medium">Shipping</p>
                                        <p className="text-xs text-muted-foreground">Pending</p>
                                    </div>
                                </div>

                                {/* Step 4: Delivery */}
                                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 opacity-50">
                                    <div className="size-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                                        <span className="text-xs font-bold">4</span>
                                    </div>
                                    <div className="text-left sm:text-center">
                                        <p className="text-sm font-medium">Delivery</p>
                                        <p className="text-xs text-muted-foreground">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="bg-secondary/30 border border-border rounded-xl p-6 mb-8 text-left grid md:grid-cols-2 gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>

                            {/* Delivery Address */}
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Truck className="size-4" /> Delivery Address
                                </h3>
                                <p className="font-medium">Alex Producer</p>
                                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                                    128 Synth Avenue, Studio B<br />
                                    Makati City, Metro Manila 1200<br />
                                    Philippines
                                </p>
                            </div>

                            {/* Estimated Delivery */}
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Calendar className="size-4" /> Estimated Delivery
                                </h3>
                                <p className="font-medium text-lg">Oct 26 - Oct 28</p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Standard Shipping (LBC Express)
                                </p>
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Payment Method</span>
                                    <span className="text-xs font-bold flex items-center gap-1">
                                        <CreditCard className="size-4" /> Visa ending in 4242
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <Link
                                href="/profile/purchases"
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-8 rounded-lg shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Track My Order</span>
                                <ArrowRight className="size-5" />
                            </Link>
                            <Link
                                href="/products"
                                className="w-full sm:w-auto bg-transparent hover:bg-secondary text-foreground font-medium py-3.5 px-8 rounded-lg border border-border transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="size-5" />
                                <span>Continue Shopping</span>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Mail className="size-4" />
                            <span>Check your email for the official receipt.</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
