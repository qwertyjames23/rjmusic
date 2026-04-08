import Link from "next/link";
import { Music, Mic, Piano, Disc, Headphones, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const iconMap = {
    Guitar: Music,
    Piano: Piano,
    Drum: Disc,
    Mic: Mic,
    Headphones: Headphones,
    Default: Music,
};

async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("categories")
        .select("name, slug, icon_name")
        .eq("is_visible", true)
        .order("name")
        .limit(5);

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data;
}

export async function CategoryGrid() {
    const categories = await getCategories();

    return (
        <section className="py-12 md:py-20 bg-[#050505]">
            <div className="container mx-auto px-4 md:px-10">
                <div className="flex items-end justify-between pb-8">
                    <h2 className="text-white text-3xl font-bold leading-tight tracking-tight font-display">BROWSE CATEGORIES</h2>
                    <Link href="/products" className="text-primary text-sm font-bold hover:text-white transition-colors flex items-center gap-1 font-display">
                        View All <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((cat) => {
                        const IconComponent = iconMap[cat.icon_name as keyof typeof iconMap] || iconMap.Default;
                        return (
                            <Link
                                key={cat.name}
                                href={`/products?category=${cat.slug}`}
                                className="group flex flex-col gap-4 rounded-xl border border-[#282f39] bg-[#1a1a1a] hover:border-primary/50 hover:bg-[#202833] p-6 items-center justify-center transition-all duration-300"
                            >
                                <div className="size-16 rounded-full bg-[#11161d] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                    <IconComponent className="size-8" />
                                </div>
                                <h3 className="text-white text-base font-bold tracking-wide font-display">{cat.name}</h3>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

