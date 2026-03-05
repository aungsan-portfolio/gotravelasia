import { Link } from "wouter";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function CookieSettings() {
    usePageMeta({
        title: "Cookie Settings - GoTravel Asia",
        description:
            "Manage your cookie preferences on GoTravel Asia. Learn about the cookies we use and control your privacy settings.",
        path: "/cookies",
    });

    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
                        Cookie Settings
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Cookies are small text files stored on your device when you visit
                                our website. They help us provide a better experience by
                                remembering your preferences and understanding how you use our
                                site.
                            </p>
                        </section>

                        <section className="bg-muted/30 p-8 rounded-lg border border-border">
                            <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Essential Cookies</h3>
                                        <p className="text-muted-foreground">
                                            Required for core functionality like navigation, user
                                            sessions, and security. These cannot be disabled.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">Analytics Cookies</h3>
                                        <p className="text-muted-foreground">
                                            Help us understand how visitors interact with our site
                                            so we can improve your experience. We use anonymized
                                            analytics data.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Functional Cookies
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Remember your preferences such as recent searches,
                                            language settings, and display options.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🤝</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Third-Party Cookies
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Our travel partners (Aviasales, Agoda, Trip.com, etc.)
                                            may set cookies to provide their services when you
                                            search for flights, hotels, or transport.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Managing Your Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You can control and delete cookies through your browser settings.
                                Please note that disabling certain cookies may affect the
                                functionality of our website, including flight search and price
                                comparison features.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">More Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For more details about how we handle your data, please read our{" "}
                                <Link
                                    href="/privacy"
                                    className="text-primary hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                                . If you have questions about our cookie practices, contact us at{" "}
                                <a
                                    href="mailto:GoTravelAsia@outlook.com"
                                    className="text-primary hover:underline"
                                >
                                    GoTravelAsia@outlook.com
                                </a>
                                .
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
