import { Link } from "wouter";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function About() {
    usePageMeta({
        title: "About Us - GoTravel Asia",
        description:
            "Learn about GoTravel Asia — your trusted travel companion for discovering cheap flights, hotels, and transport across Southeast Asia.",
        path: "/about",
    });

    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
                        About GoTravel Asia
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                GoTravel Asia was born from a simple idea: making travel across
                                Southeast Asia accessible, affordable, and enjoyable for everyone.
                                We compare thousands of flights, hotels, and transport options to
                                help you find the best deals — saving you time and money.
                            </p>
                        </section>

                        <section className="bg-muted/30 p-8 rounded-lg border border-border">
                            <h2 className="text-2xl font-bold mb-6">What We Do</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">✈️</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Flight Comparison</h3>
                                        <p className="text-muted-foreground">
                                            Compare prices across major airlines and OTAs to find
                                            the cheapest flights to Bangkok, Bali, Singapore, Tokyo,
                                            and 50+ destinations.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🏨</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Hotel Deals</h3>
                                        <p className="text-muted-foreground">
                                            From budget hostels to luxury resorts — we search Agoda,
                                            Booking.com, and Trip.com to find the best rates.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🚌</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Transport Booking</h3>
                                        <p className="text-muted-foreground">
                                            Buses, trains, ferries, and private transfers across
                                            Thailand, Vietnam, Cambodia, Laos, and more via 12Go Asia.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We're a small team of travel enthusiasts based in Chiang Mai,
                                Thailand. Having traveled extensively throughout Asia, we
                                understand the challenges and joys of exploring this incredible
                                region. Our goal is to share that knowledge and make your next
                                trip as smooth as possible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Trusted Partners</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We work with industry-leading travel brands including Aviasales,
                                Agoda, Trip.com, 12Go Asia, Klook, Airalo, and Travelpayouts
                                to bring you the most comprehensive travel comparison platform
                                for Asia.
                            </p>
                        </section>
                    </div>

                    <p className="text-center mt-12">
                        <Link href="/" className="text-primary hover:underline">
                            ← Back to Home
                        </Link>
                    </p>
                </div>
            </section>
        </Layout>
    );
}
