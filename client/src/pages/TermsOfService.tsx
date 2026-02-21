import { Link } from "wouter";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function TermsOfService() {
    usePageMeta({
        title: "Terms of Service",
        description: "GoTravel Asia terms of service, usage conditions, and user guidelines for our travel comparison platform.",
    });

    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">Terms of Service</h1>
                    <p className="text-muted-foreground mb-12">Last Updated: February 9, 2026</p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using GoTravelAsia ("we," "our," or "the Site"), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use this website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                GoTravelAsia is an affiliate marketing website that provides travel information and booking recommendations for travel to Thailand, primarily for Myanmar and international travelers. We earn commissions when you make purchases through our affiliate links.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Affiliate Relationships</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We maintain affiliate relationships with the following partners:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Kiwi.com (flight bookings)</li>
                                <li>Agoda (hotel accommodations)</li>
                                <li>Klook (tours and activities)</li>
                                <li>Welcome Pickups (airport transfers)</li>
                                <li>Airalo (eSIM services)</li>
                                <li>EKTA Traveling (travel insurance)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                When you click our links and make purchases, we may earn a commission at no additional cost to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. No Warranty</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                The information on this Site is provided "as is" without any warranties. We do not guarantee:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Accuracy of travel information</li>
                                <li>Availability of advertised prices</li>
                                <li>Quality of third-party services</li>
                                <li>Uninterrupted access to the Site</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                When you book through our affiliate partners, you enter into a separate agreement with them. We are not responsible for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Booking issues or cancellations</li>
                                <li>Service quality</li>
                                <li>Refund disputes</li>
                                <li>Changes in pricing or availability</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                GoTravelAsia shall not be liable for any direct, indirect, incidental, or consequential damages arising from:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Use of information on this Site</li>
                                <li>Bookings made through affiliate links</li>
                                <li>Technical issues or website downtime</li>
                                <li>Actions of third-party service providers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">7. User Conduct</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Use the Site for illegal purposes</li>
                                <li>Attempt to hack or disrupt the Site</li>
                                <li>Copy or reproduce content without permission</li>
                                <li>Misuse our affiliate links</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All content on GoTravelAsia, including text, graphics, logos, and images, is owned by us or our content providers and protected by copyright laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify these Terms at any time. Continued use of the Site after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">10. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms are governed by the laws of Thailand. Any disputes shall be resolved in the courts of Chiang Mai, Thailand.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For questions about these Terms, contact us at:<br />
                                <strong>Email:</strong> legal@gotravelasia.com<br />
                                <strong>Address:</strong> Chiang Mai, Thailand
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
