import { Link } from "wouter";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Contact() {
    usePageMeta({
        title: "Contact Us - GoTravel Asia",
        description: "Get in touch with GoTravel Asia for travel inquiries, partnership opportunities, or feedback about our Southeast Asia travel guides and flight comparison tools.",
        path: "/contact",
    });

    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">Contact Us</h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Have questions about traveling to Thailand? Need help with bookings? We're here to help!
                            </p>
                        </section>

                        <section className="bg-muted/30 p-8 rounded-lg border border-border">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">📧</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email Us</h3>
                                        <p className="text-muted-foreground">
                                            <a href="mailto:support@gotravelasia.com" className="text-primary hover:underline">
                                                support@gotravelasia.com
                                            </a>
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Response Time: Within 24-48 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">📍</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Office Location</h3>
                                        <p className="text-muted-foreground">Chiang Mai, Thailand</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Partnership Inquiries</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Interested in partnering with GoTravelAsia? We're always looking for new affiliate relationships
                                and collaboration opportunities. Reach out to us at{" "}
                                <a href="mailto:partners@gotravelasia.com" className="text-primary hover:underline">
                                    partners@gotravelasia.com
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Feedback</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We value your feedback! If you have suggestions on how we can improve our travel guides
                                or website experience, please let us know.
                            </p>
                        </section>
                    </div>

                    <p className="text-center mt-12">
                        <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
                    </p>
                </div>
            </section>
        </Layout>
    );
}
