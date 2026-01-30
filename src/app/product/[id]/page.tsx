import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import { Star } from "lucide-react";
import { BuyBox } from "@/components/features/BuyBox";
import { ProductTabs } from "@/components/features/ProductTabs";
import { ProductCard } from "@/components/features/ProductCard";
// import { RelatedProducts } from "@/components/features/RelatedProducts"; // Future Step

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
                <span className="capitalize">{product.category}</span>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Images (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#282f39] bg-[#1a1f26]">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-700"
                        />
                        {product.tags?.[0] && (
                            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg shadow-black/20">
                                {product.tags[0]}
                            </span>
                        )}
                    </div>

                    {/* Thumbnail Mockup */}
                    <div className="grid grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square rounded-lg border border-[#282f39] bg-[#1a1f26] overflow-hidden cursor-pointer hover:border-primary transition-colors">
                                <img src={product.images[0]} alt="" className="h-full w-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>

                    {/* Tabs Section (Desktop placement basically, but flows naturally here) */}
                    <div className="mt-8 hidden lg:block">
                        <ProductTabs description={product.description} />
                    </div>
                </div>

                {/* Right Column: Info & Buy Box (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-8">

                    {/* Header Info */}
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="size-4 fill-current" />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground hover:text-white cursor-pointer transition-colors">
                                4.8 (124 reviews)
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                            {product.name}
                        </h1>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-primary">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.originalPrice)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="text-gray-400 leading-relaxed text-sm border-t border-b border-[#282f39] py-6">
                        <p>
                            Experience the warmth of true analog synthesis. The RJ-X1 combines vintage character with modern connectivity, making it the centerpiece of any professional studio.
                        </p>
                    </div>

                    {/* Buy Box Component */}
                    <BuyBox product={product} />

                    {/* Key Specs Grid (Small Preview) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1c222b] border border-[#282f39] p-3 rounded-lg">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Warranty</span>
                            <span className="font-bold text-sm">3 Years</span>
                        </div>
                        <div className="bg-[#1c222b] border border-[#282f39] p-3 rounded-lg">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Return Policy</span>
                            <span className="font-bold text-sm">30 Days</span>
                        </div>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="lg:hidden mt-8">
                        <ProductTabs description={product.description} />
                    </div>
                </div>
            </div>

            {/* Recommendations Row (Mock) */}
            <div className="mt-20 pt-10 border-t border-[#282f39]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">You might also like</h2>
                    <Link href="/" className="text-primary text-sm font-bold hover:underline">View all</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct) => (
                        <ProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                </div>
            </div>
        </div>
    );
}
