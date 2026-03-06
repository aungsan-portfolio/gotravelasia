import { useEffect } from "react";
import { Scale } from "lucide-react";

export default function TermsOfService() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.title = "Terms of Service — GoTravel Asia";
    }, []);

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="bg-primary/5 border-b border-border py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Scale className="w-8 h-8 text-primary" />
                        <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                            Legal
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground text-sm">Last updated: March 6, 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
                <p>
                    Welcome to GoTravel Asia. By accessing or using our website, you agree to be bound by these Terms of Service.
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    GoTravel Asia provides a platform to search for flights, transportation, and read travel guides across Asia.
                    We aggregate data from third-party partners to display estimated prices and schedules.
                </p>

                <h2>3. Affiliate Disclaimer</h2>
                <p>
                    We participate in affiliate marketing programs. When you click on links to various merchants on this site and make a purchase,
                    this can result in this site earning a commission. This comes at no additional cost to you and helps us maintain the website.
                </p>
                <p>
                    Prices and availability are subject to change. We act only as an informational aggregator and are not responsible for any issues
                    with actual bookings made on third-party websites.
                </p>

                <h2>4. User Conduct</h2>
                <p>You agree to use the site only for lawful purposes. You are forbidden from:</p>
                <ul>
                    <li>Scraping or extracting data from our website without prior permission.</li>
                    <li>Using our platform in any way that disrupts the experience for other users.</li>
                </ul>

                <h2>5. Intellectual Property</h2>
                <p>
                    All content, design, text, graphics, and interfaces on this website are the intellectual property of GoTravel Asia,
                    unless otherwise noted. You may not reproduce, distribute, or modify our content without written consent.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                    GoTravel Asia is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied,
                    regarding the accuracy, reliability, or availability of our website or the information contained within.
                </p>

                <h2>7. Contact Information</h2>
                <p>
                    Questions about the Terms of Service should be sent to us at
                    <a href="mailto:legal@gotravelasia.com"> legal@gotravelasia.com</a>.
                </p>
            </div>
        </div>
    );
}
