import Link from "next/link";
import { Facebook, Instagram, Twitter, CreditCard, Wallet } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-card py-12 text-card-foreground">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
                    {/* Shop Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold mb-2">Shop</h4>
                        <Link href="/products?category=guitars" className="text-sm text-muted-foreground hover:text-primary transition-colors">Guitars</Link>
                        <Link href="/products?category=percussion" className="text-sm text-muted-foreground hover:text-primary transition-colors">Percussion</Link>
                        <Link href="/products?category=keyboards" className="text-sm text-muted-foreground hover:text-primary transition-colors">Keyboards</Link>
                        <Link href="/products?category=studio" className="text-sm text-muted-foreground hover:text-primary transition-colors">Studio Gear</Link>
                    </div>

                    {/* Support Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold mb-2">Support</h4>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
                        <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shipping Policy</Link>
                        <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">Returns</Link>
                        <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                    </div>

                    {/* Company Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold mb-2">Company</h4>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About RJ MUSIC</Link>
                        <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link>
                        <Link href="/locations" className="text-sm text-muted-foreground hover:text-primary transition-colors">Locations</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>

                    {/* Follow Us Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold mb-2">Follow Us</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Facebook className="size-6" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Instagram className="size-6" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="size-6" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">© 2024 RJ MUSIC. All rights reserved.</p>
                    <div className="flex gap-6">
                        <CreditCard className="size-6 text-muted-foreground" />
                        <Wallet className="size-6 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
