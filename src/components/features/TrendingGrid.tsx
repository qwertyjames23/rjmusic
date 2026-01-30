import { ShoppingCart } from "lucide-react";

const products = [
    {
        id: 1,
        name: "Stratocaster Ultra",
        category: "Electric Guitars",
        price: "₱106,350.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCShBWHoyXynFzRx6jj2ENw3NnEjYHcDdYck0r1ojzWsoSbYQgsgkQb1O9rPQpHVgZ1kD70sZLVVEmr_nWierrNlhrCV2Jl2pMobXNcVytrj5cuXA39GnJatZajOC7cbuHtUrby9ZEbpiCfehNZyCrfwyxBjrxKDPH69cs5Mzznou4qVoqZuY0eLeXoGrTp-vDORNdaAkW34_8xkRxfUzvrqwbP-NvbxiWZM4NEA9i0IdxvLvvfbDq5cx7NgMFw61pz6VXGfCrkfkk",
        tag: "NEW"
    },
    {
        id: 2,
        name: "Studio Vocal Mic",
        category: "Recording",
        price: "₱22,350.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9XnAl1l2UVBJVcXsqsXI7iswMvSokID__m1J6fyTJifp11txkPrbGSbF-B5XkZHE5rWaT06E1fjzEUd5lxY-XQto6H7tjj6sXJNLDbU-j2s3U9gCY6WTW7CeTrCoZQTYc8VYdiPEIH9IvXyTxWCWLZGR2D2aYTqapUaWJ1VZEM66wA1EMuBahpvWPiuZ6jWaOG0QHtv0ABUeCmpy0Zpmr2kykLzG5FWOYZxy8X-iyyQmMwlBjW_5kDc_i3vIVdbB9LVfKQAhH1-s"
    },
    {
        id: 3,
        name: "Analog Synth Pro",
        category: "Synthesizers",
        price: "₱41,950.00",
        originalPrice: "₱50,350.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBMYeu1-xtAK9ATwz9ZHbHPD_BEilR_1np8SgN2llmG3MBi17qZWksmg3LLQoV9e3QELsdhmgkXUjQ2zDHrZUu6n2G6FR61SjbVJpvDyLo8HzDwqfs4ZaxJL3tgf6y52Qhzv04naqgJGnhvSw9KzL26lC0i82IcYw_5MJVdhxBidZo4yqkVkyRDqWKRzoxj45zRvFIbPIp8CdOfDJTYscECQG7PXiEt_P63g7cPQS8f6ECpc6s1iJ57Dr0QIjacnJSjoRfu2tY16Q",
        tag: "SALE"
    },
    {
        id: 4,
        name: "Reference Headphones",
        category: "Audio & Accessories",
        price: "₱13,950.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpRYoSQc2gDdbbdjKVk-V7IrSvHpHKv8J-SNPQ4nP2gM6zMi8p4DxbcA4pXxDaCcpgIIUHxRjizdn9eZ1zhn4Nb1-sV5YIM8khiQFFpUGyKTYRw0_ZHoxkR5hQimrVxE9Yn7Shx47o3jYfMQbwdEVkfbhtQpoaE0RHYH7jEYqGimvEjgvuUp4hmACo6N2Z21li3VSCheVBj9ypLB4_mULH9Xlxyx_OGrqqR_UOhBCiFMi3gxIiMI5s7fdmWclcxmOwOQZFFryVmC8"
    },
];

export function TrendingGrid() {
    return (
        <section className="py-12 bg-card/50">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-2xl font-bold leading-tight tracking-tight pb-6 text-foreground">TRENDING NOW</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                            <div className="relative w-full aspect-[4/5] bg-secondary/50 p-4 flex items-center justify-center overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-md"
                                />
                                {product.tag && (
                                    <div className={`absolute top-3 right-3 text-white text-xs font-bold px-2 py-1 rounded ${product.tag === 'SALE' ? 'bg-destructive' : 'bg-primary'}`}>
                                        {product.tag}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1 gap-2">
                                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{product.name}</h3>
                                <p className="text-muted-foreground text-sm">{product.category}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex flex-col">
                                        {product.originalPrice && (
                                            <span className="text-muted-foreground text-sm line-through">{product.originalPrice}</span>
                                        )}
                                        <span className="text-foreground font-medium text-lg">{product.price}</span>
                                    </div>
                                    <button className="size-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <ShoppingCart className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
