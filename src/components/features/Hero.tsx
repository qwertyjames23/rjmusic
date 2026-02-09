import Link from "next/link";

export function Hero() {
    return (
        <section className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 bg-surface-dark">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxO-MGXJmT0qSByrgOAUiOMqesh8GN4mX2e8TCi8PjV7gV3sy7fWmBESZRM9gcQvnoHY5wOFHOtP4OYWgHRrpsbVI92ZD1iYCTF6UkfFhiOArg_L0xHhxRAP59TRTdGlxKI9f_rfrcyXEfVwcokQdyx-7xPiHVwWyM2caYLwi22A1shTjVJR9VekNSOo-AI-XFb7mQa-aZgWf-L3NxAVwrTRBasLaj8xeuStrczHl1mYhnkCNckm69nF3XttRxcRIdPYlrSUprnsk"
                    alt="Studio Background"
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-10">
                <div className="layout-content-container flex flex-col w-full max-w-[1440px]">
                    <div className="max-w-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-primary font-bold tracking-widest text-sm uppercase font-display">
                                Professional Audio Equipment
                            </h2>
                            <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter glow-text font-display">
                                UNLEASH<br />YOUR SOUND.
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl font-light mt-4 max-w-md leading-relaxed font-body">
                                Discover premium instruments and studio gear curated for the modern creator.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/products"
                                className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 transition-all text-white text-base font-bold tracking-wide shadow-[0_0_20px_rgba(19,109,236,0.3)] hover:shadow-[0_0_30px_rgba(19,109,236,0.5)] font-display"
                            >
                                SHOW NOW
                            </Link>
                            {/* <Link
                                href="/brands"
                                className="flex items-center justify-center rounded-lg h-12 px-6 border border-gray-700 hover:border-white bg-transparent text-white transition-colors text-base font-medium font-display"
                            >
                                VIEW BRANDS
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
