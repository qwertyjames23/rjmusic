import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxO-MGXJmT0qSByrgOAUiOMqesh8GN4mX2e8TCi8PjV7gV3sy7fWmBESZRM9gcQvnoHY5wOFHOtP4OYWgHRrpsbVI92ZD1iYCTF6UkfFhiOArg_L0xHhxRAP59TRTdGlxKI9f_rfrcyXEfVwcokQdyx-7xPiHVwWyM2caYLwi22A1shTjVJR9VekNSOo-AI-XFb7mQa-aZgWf-L3NxAVwrTRBasLaj8xeuStrczHl1mYhnkCNckm69nF3XttRxcRIdPYlrSUprnsk"
                    alt="Studio Background"
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-primary font-bold tracking-widest text-sm uppercase">
                            Professional Audio Equipment
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter drop-shadow-2xl">
                            UNLEASH<br />YOUR SOUND.
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl font-light mt-4 max-w-md leading-relaxed">
                            Discover premium instruments and studio gear curated for the modern creator.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/products"
                            className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 transition-all text-primary-foreground text-base font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40"
                        >
                            SHOP COLLECTION
                        </Link>
                        <Link
                            href="/brands"
                            className="flex items-center justify-center rounded-lg h-12 px-6 border border-input hover:border-foreground bg-transparent text-foreground transition-colors text-base font-medium"
                        >
                            VIEW BRANDS
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
