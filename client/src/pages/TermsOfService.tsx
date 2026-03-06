import { useEffect } from "react";
import { FileText, AlertTriangle, Link, Ban, Scale, Mail, RefreshCw, Globe } from "lucide-react";

const SITE_URL = "https://gotravel-asia.vercel.app";
const CONTACT_EMAIL = "aungsan20179@gmail.com";
const LAST_UPDATED = "March 6, 2026";

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
    return (
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
            </div>
            <div className="pl-12 text-muted-foreground leading-relaxed space-y-3">{children}</div>
        </section>
    );
}

export default function TermsOfService() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.title = "Terms of Service — GoTravel Asia";
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="bg-primary/5 border-b border-border py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                            Legal
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground text-sm">
                        Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective immediately
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Intro */}
                <p className="text-muted-foreground leading-relaxed mb-10 p-4 bg-muted/30 rounded-lg border border-border text-sm">
                    By accessing or using GoTravel Asia (<a href={SITE_URL} className="text-primary underline">{SITE_URL}</a>),
                    you agree to be bound by these Terms of Service. If you do not agree, please do not use this website.
                </p>

                <Section icon={<Globe className="w-4 h-4" />} title="About GoTravel Asia">
                    <p>
                        GoTravel Asia is a travel information and deal aggregation website focused on Southeast Asia,
                        particularly travel to and within Myanmar, Thailand, and neighboring countries. We provide:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Flight price information and tracking alerts.</li>
                        <li>Transport schedules and booking links (bus, train, ferry).</li>
                        <li>Travel guides and destination information.</li>
                        <li>Affiliate links to third-party booking platforms.</li>
                    </ul>
                    <p className="mt-3">
                        We are an <strong>informational service</strong>, not a travel agency. We do not sell flights,
                        transport tickets, or accommodations directly.
                    </p>
                </Section>

                <Section icon={<AlertTriangle className="w-4 h-4" />} title="Accuracy of Information">
                    <p>
                        We strive to provide accurate and up-to-date travel information. However:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Flight prices, schedules, and availability are subject to change without notice.</li>
                        <li>Transport schedules displayed may be sample/reference data and may not reflect real-time availability.</li>
                        <li>We make no guarantees about the accuracy, completeness, or timeliness of any information on this site.</li>
                    </ul>
                    <p className="mt-3 font-medium text-foreground">
                        Always verify bookings directly with the airline, transport provider, or booking platform before making travel decisions.
                    </p>
                </Section>

                <Section icon={<Link className="w-4 h-4" />} title="Affiliate Links & Commissions">
                    <p>
                        GoTravel Asia participates in affiliate programs. This means:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Some links on this website are affiliate links to third-party booking platforms (e.g., 12Go.asia, airline websites, Travelpayouts partners).</li>
                        <li>When you click these links and make a purchase, we may earn a small commission at <strong>no extra cost to you</strong>.</li>
                        <li>Affiliate relationships do not influence our editorial content or recommendations.</li>
                    </ul>
                    <p className="mt-3">
                        We are committed to transparency — affiliate links are clearly disclosed wherever they appear.
                    </p>
                </Section>

                <Section icon={<Ban className="w-4 h-4" />} title="Prohibited Uses">
                    <p>You agree not to use GoTravel Asia to:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Scrape, crawl, or systematically extract data from the website.</li>
                        <li>Attempt to gain unauthorized access to any part of the website or its backend systems.</li>
                        <li>Use the site for any unlawful purpose or in violation of any applicable laws.</li>
                        <li>Transmit spam, malware, or any harmful content through our contact forms or newsletter system.</li>
                        <li>Impersonate GoTravel Asia or its representatives.</li>
                    </ul>
                </Section>

                <Section icon={<Scale className="w-4 h-4" />} title="Disclaimer of Warranties">
                    <p>
                        GoTravel Asia is provided <strong>"as is"</strong> without any warranties, express or implied. We do not warrant that:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>The website will be available at all times or error-free.</li>
                        <li>Information on the website is accurate, complete, or current.</li>
                        <li>The website is free from viruses or other harmful components.</li>
                    </ul>
                    <p className="mt-3">
                        To the fullest extent permitted by law, GoTravel Asia shall not be liable for any direct,
                        indirect, incidental, or consequential damages arising from your use of this website or
                        reliance on any information provided herein.
                    </p>
                </Section>

                <Section icon={<Globe className="w-4 h-4" />} title="Third-Party Websites">
                    <p>
                        Our website contains links to third-party websites. These links are provided for your
                        convenience only. We have no control over the content of those sites and accept no
                        responsibility for them or for any loss or damage that may arise from your use of them.
                    </p>
                    <p className="mt-3">
                        Visiting a third-party website is at your own risk. Please review their terms of service
                        and privacy policies before making any purchases or providing any personal information.
                    </p>
                </Section>

                <Section icon={<RefreshCw className="w-4 h-4" />} title="Changes to Terms">
                    <p>
                        We reserve the right to modify these Terms of Service at any time. Changes will be effective
                        immediately upon posting to the website. Your continued use of GoTravel Asia after any changes
                        constitutes your acceptance of the new terms.
                    </p>
                    <p className="mt-3">
                        We recommend reviewing these terms periodically. The "Last updated" date at the top of this
                        page indicates when the terms were last revised.
                    </p>
                </Section>

                <Section icon={<Mail className="w-4 h-4" />} title="Contact Us">
                    <p>If you have any questions about these Terms of Service, please contact us:</p>
                    <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
                        <p><strong>GoTravel Asia</strong></p>
                        <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a></p>
                        <p>Website: <a href={SITE_URL} className="text-primary underline">{SITE_URL}</a></p>
                    </div>
                </Section>

                <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center pb-12">
                    <p>
                        These Terms of Service were last updated on {LAST_UPDATED}. By using this website,
                        you acknowledge that you have read, understood, and agree to be bound by these terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
