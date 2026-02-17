import { MapPin, Clock, Globe, Truck } from "lucide-react";

export default function LocationsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-6 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Where We Operate</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        RJ Music is an online music store based in Balingasag, Misamis Oriental — shipping nationwide across the Philippines.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Info */}
                    <div className="flex flex-col gap-6">
                        {/* Base of Operations */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Based In</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Baliwagan, Balingasag,<br />
                                    Misamis Oriental, Philippines
                                </p>
                            </div>
                        </div>

                        {/* Online Store */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Globe className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Online Store</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We currently operate as an online-only store. Browse and order anytime through our website — no physical walk-in store at this time.
                                </p>
                            </div>
                        </div>

                        {/* Shipping Coverage */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Truck className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Nationwide Shipping</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                    We ship to all provinces across the Philippines via J&T Express.
                                </p>
                                <div className="text-sm text-muted-foreground space-y-0.5">
                                    <p>Misamis Oriental / CDO Area: 1–3 days</p>
                                    <p>Mindanao (other areas): 3–5 days</p>
                                    <p>Visayas: 5–7 days</p>
                                    <p>Luzon: 5–7 days</p>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Business Hours</h3>
                                <div className="text-sm text-muted-foreground space-y-0.5">
                                    <p>Online Orders: Available 24/7</p>
                                    <p>Customer Support: Monday - Sunday, 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="rounded-xl overflow-hidden border border-border bg-card h-full min-h-[400px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d344.47987351817386!2d124.78375730819491!3d8.719125295549716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32ffe182e7379beb%3A0xb2cb5c21d5031042!2sPQ9M%2BMF7%2C%20Butuan%20-%20Cagayan%20de%20Oro%20-%20Iligan%20Rd%2C%20Balingasag%2C%20Misamis%20Oriental!5e1!3m2!1sen!2sph!4v1771299480653!5m2!1sen!2sph"
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: "400px" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="RJ Music - Based in Balingasag, Misamis Oriental"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
