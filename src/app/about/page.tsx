export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">About RJ Music</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Driven by passion, built on trust — supporting musicians and creators every step of the way.
                    </p>
                </div>

                <div className="flex flex-col gap-10">
                    {/* Our Story */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">Our Story</h2>
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                            <p>
                                RJ Music was founded with a genuine passion for music and a vision to build a trusted brand dedicated to musicians and creators.
                            </p>
                            <p>
                                From the beginning, the goal has been to provide quality and affordable products, dependable service, and a seamless shopping experience. As RJ Music continues to grow, we remain committed to expanding our offerings and strengthening our presence in the music community.
                            </p>
                            <p>
                                We are driven by creativity, consistency, and the desire to support every stage of the musical journey.
                            </p>
                        </div>
                    </section>

                    {/* Our Mission */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">Our Mission</h2>
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                            <p>
                                Our mission is to provide reliable, high-quality, and affordable products that empower creativity and enhance musical experiences.
                            </p>
                            <p>
                                We strive to deliver real value, build long-term customer trust, and continuously improve our services as we grow.
                            </p>
                        </div>
                    </section>

                    {/* What We Offer */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">What We Offer</h2>
                        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                            <p>
                                RJ Music offers a growing range of carefully selected products designed to support musicians and creators.
                            </p>
                            <p>
                                Our catalog continues to expand as we work to meet evolving needs while maintaining quality and fair pricing.
                            </p>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">Why Choose Us</h2>
                        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                Quality products at affordable prices
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                Reliable and secure ordering process
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                Responsive customer support
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                Continuous growth and product expansion
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                                Commitment to customer satisfaction
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
