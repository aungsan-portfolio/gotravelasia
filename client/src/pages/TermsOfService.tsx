import Layout from "@/components/Layout";

export default function TermsOfService() {
    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">Terms of Service</h1>
                    <p className="text-muted-foreground mb-12">Last updated: February 8, 2026</p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using GoTravelAsia (gotravelasia.com), you accept and agree to be bound by
                                these Terms of Service. If you do not agree to these terms, please do not use our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                GoTravelAsia provides travel information, guides, and recommendations for traveling in Thailand.
                                We also provide links to third-party booking services for flights, hotels, tours, and other travel services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Affiliate Disclosure</h2>
                            <div className="bg-secondary/10 border border-secondary p-6 rounded-lg">
                                <p className="text-foreground leading-relaxed">
                                    <strong>Important:</strong> GoTravelAsia is a participant in affiliate programs including
                                    Kiwi.com, Traveloka, Klook, 12Go.asia, Airalo, and others. This means we earn commissions
                                    when you make purchases through our links, at no additional cost to you.
                                </p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Our affiliate relationships do not influence our recommendations. We only recommend services
                                we believe provide value to our readers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                When you click on links to third-party websites or services, you leave our website and
                                become subject to the terms and privacy policies of those third parties. We are not responsible
                                for the content, accuracy, or practices of third-party websites.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Accuracy of Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We strive to provide accurate and up-to-date travel information. However, travel conditions,
                                prices, schedules, and policies change frequently. We recommend verifying all information
                                directly with service providers before making travel arrangements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                GoTravelAsia shall not be liable for any direct, indirect, incidental, or consequential damages
                                arising from your use of our website or reliance on information provided. This includes, but is
                                not limited to, travel disruptions, booking issues, or financial losses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All content on this website, including text, graphics, logos, and images, is the property of
                                GoTravelAsia or its content providers and is protected by copyright laws. You may not reproduce,
                                distribute, or use our content without written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">8. User Conduct</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">By using our website, you agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Use the website for any unlawful purpose</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with the proper functioning of the website</li>
                                <li>Scrape or collect data from our website without permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify these Terms of Service at any time. Changes will be effective
                                immediately upon posting to the website. Your continued use of the website constitutes
                                acceptance of the modified terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For questions about these Terms of Service, please contact us at:<br />
                                <strong>Email:</strong> legal@gotravelasia.com
                            </p>
                        </section>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
