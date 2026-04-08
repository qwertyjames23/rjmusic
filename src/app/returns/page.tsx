import { RotateCcw, CheckCircle, XCircle, ClipboardList, Wallet, Truck, HelpCircle } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Return & Refund Policy</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Your satisfaction matters to us. Here&apos;s everything you need to know about returns and refunds.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Return Policy Overview */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <RotateCcw className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Return Policy Overview</h3>
                            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                                <p>We accept returns within <strong className="text-foreground">7 days</strong> from the date of delivery.</p>
                                <p>To qualify, the item must meet the conditions stated below.</p>
                            </div>
                        </div>
                    </div>

                    {/* Eligible for Return */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="size-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Eligible for Return</h3>
                            <p className="text-sm text-muted-foreground mb-2">Items may be eligible for return if:</p>
                            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    The item is defective or damaged upon arrival
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    The wrong item was received
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    The item is significantly different from its description
                                </li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-3">All return requests must be reported within 7 days of receiving the item.</p>
                        </div>
                    </div>

                    {/* Not Eligible for Return */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <XCircle className="size-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Not Eligible for Return</h3>
                            <p className="text-sm text-muted-foreground mb-2">Returns will not be accepted for:</p>
                            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    Items with visible signs of use
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    Accessories or items with broken seals
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    Items damaged due to misuse or improper handling
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    Change of mind or buyer&apos;s remorse
                                </li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-3">We encourage customers to review product details carefully before placing an order.</p>
                        </div>
                    </div>

                    {/* How to Request a Return */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">How to Request a Return</h3>
                            <p className="text-sm text-muted-foreground mb-2">To request a return:</p>
                            <ol className="text-sm text-muted-foreground leading-relaxed space-y-1.5 list-decimal list-inside">
                                <li>Contact our support team via email or message.</li>
                                <li>Provide your order number and a clear description of the issue.</li>
                                <li>Attach photos or videos as proof (if applicable).</li>
                                <li>Wait for return approval and instructions before sending the item back.</li>
                            </ol>
                            <p className="text-xs text-muted-foreground mt-3">Returns sent without prior approval may not be accepted.</p>
                        </div>
                    </div>

                    {/* Refund Process */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Wallet className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Refund Process</h3>
                            <p className="text-sm text-muted-foreground mb-2">Once the returned item is received and inspected:</p>
                            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                    Approved refunds will be processed within <strong className="text-foreground">3–7 business days</strong>.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                    Refunds will be issued through the original payment method.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                    Processing times may vary depending on your payment provider.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Return Shipping */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Truck className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Return Shipping</h3>
                            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                                <p>If the return is due to a defective, damaged, or incorrect item, <strong className="text-foreground">we will cover the return shipping cost</strong>.</p>
                                <p>If the return is due to other reasons, the customer will be responsible for return shipping fees.</p>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Questions?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you have any questions about returns or refunds, email us at{" "}
                                <a href="mailto:rjmusicshop@gmail.com" className="text-primary hover:underline">
                                    rjmusicshop@gmail.com
                                </a>{" "}
                                or visit our{" "}
                                <a href="/contact" className="text-primary hover:underline">
                                    Contact Us
                                </a>{" "}
                                page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
