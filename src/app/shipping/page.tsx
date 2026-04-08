import { Truck, Clock, MapPin, PackageCheck, AlertTriangle, HelpCircle } from "lucide-react";

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Shipping Policy</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Everything you need to know about how we ship your orders from Balingasag, Misamis Oriental.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Processing Time */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Order Processing</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All orders are processed within <strong className="text-foreground">1–2 business days</strong> after payment confirmation.
                                Orders placed on weekends or holidays will be processed on the next business day.
                            </p>
                        </div>
                    </div>

                    {/* Delivery Timeframes */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Truck className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-2">Estimated Delivery Times</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Delivery times are estimated from the date of shipment, not the date of order.
                            </p>
                            <div className="rounded-lg border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Destination</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Est. Delivery</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-border">
                                            <td className="px-4 py-2.5">Misamis Oriental / CDO Area</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">1–3 business days</td>
                                        </tr>
                                        <tr className="border-b border-border">
                                            <td className="px-4 py-2.5">Mindanao (other areas)</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">3–5 business days</td>
                                        </tr>
                                        <tr className="border-b border-border">
                                            <td className="px-4 py-2.5">Visayas</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">5–7 business days</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2.5">Luzon</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">5–7 business days</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Delivery times may vary during peak seasons, holidays, or due to courier delays.
                            </p>
                        </div>
                    </div>

                    {/* Shipping Partner */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Shipping Partner</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We ship all orders via <strong className="text-foreground">J&T Express</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Shipping Fees & Tracking */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <PackageCheck className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Shipping Fees & Tracking</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Shipping fees are calculated at checkout based on the weight and your delivery location.
                                Once your order has been shipped, you will receive a tracking number via email so you can monitor your delivery in real time.
                            </p>
                        </div>
                    </div>

                    {/* Damaged Items */}
                    <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                        <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-2">Damaged or Lost Items</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If your order arrives damaged, please contact us within <strong className="text-foreground">48 hours</strong> of receiving it.
                                Include photos of the damaged item and packaging so we can process a replacement or refund.
                                For lost packages, please reach out and we will coordinate with J&T Express to resolve the issue.
                            </p>
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
                                If you have any questions about shipping, feel free to email us at{" "}
                                <a href="mailto:rjmusicshop@gmail.com" className="text-primary hover:underline">
                                    rjmusicshop@gmail.com
                                </a>{" "}
                                or visit our{" "}
                                <a href="/contact" className="text-primary hover:underline">
                                    Contact Us
                                </a>{" "}
                                page. We typically respond within 24 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
