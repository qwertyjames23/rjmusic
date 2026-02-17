import { Mail, Clock, Facebook, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ContactForm } from "./_components/ContactForm";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-6 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Contact Us</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Have questions? We&apos;d love to hear from you. Reach out through any of the channels below.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Left Column - Contact Info */}
                    <div className="flex flex-col gap-6">
                        {/* Email */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Email Us</h3>
                                <a
                                    href="mailto:rjmusicshop@gmail.com"
                                    className="text-sm text-primary hover:underline"
                                >
                                    rjmusicshop@gmail.com
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">We typically respond within 24 hours</p>
                            </div>
                        </div>

                        {/* Facebook */}
                        <div className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Facebook className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Facebook</h3>
                                <a
                                    href="https://www.facebook.com/profile.php?id=61584616634834"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Visit our Facebook Page
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">Follow us for updates and promotions</p>
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

                        {/* FAQ Link */}
                        <Link href="/faq" className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group">
                            <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <HelpCircle className="size-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Frequently Asked Questions</h3>
                                <p className="text-sm text-muted-foreground">
                                    Find quick answers to common questions about orders, shipping, and more.
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="flex flex-col gap-6">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
