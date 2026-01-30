import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import { Check, Shield, Truck, Star, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Gallery Section */}
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary/20">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                        />
                        {product.tags?.[0] && (
                            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full z-10">
                                {product.tags[0]}
                            </span>
                        )}
                    </div>
                    {/* Thumbnails would go here if we had more images */}
                </div>

                {/* Product Info Section */}
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700 px-2">

                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary tracking-widest uppercase">
                                {product.brand}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-foreground">{product.rating}</span>
                                <span>({product.reviews} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                            {product.name}
                        </h1>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3 pb-4 border-b border-border">
                        <h2 className="text-3xl font-bold">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}
                        </h2>
                        {product.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through mb-1">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.originalPrice)}
                            </span>
                        )}
                        {product.originalPrice && (
                            <span className="text-sm text-destructive font-bold mb-1.5 ml-auto">
                                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                    </p>

                    {/* Features List */}
                    {product.features && (
                        <div className="flex flex-col gap-2">
                            <h3 className="font-bold text-sm">Key Features</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="size-4 text-primary shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button className={cn(
                            "flex-1 h-12 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2",
                            product.inStock
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                            disabled={!product.inStock}
                        >
                            {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                        </button>
                        <div className="flex gap-2">
                            <button className="h-12 w-12 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Add to Wishlist">
                                <Heart className="size-5" />
                            </button>
                            <button className="h-12 w-12 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Share Product">
                                <Share2 className="size-5" />
                            </button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4 pt-6 mt-auto">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                            <Truck className="size-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold font-sans">Free Shipping</span>
                                <span className="text-[10px] text-muted-foreground">On all orders over ₱5,000</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                            <Shield className="size-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold font-sans">2 Year Warranty</span>
                                <span className="text-[10px] text-muted-foreground">Professional protection</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
