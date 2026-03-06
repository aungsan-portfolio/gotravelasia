import { useEffect } from "react";
import { Shield, Mail, Globe, Database, Eye, UserX, RefreshCw, Phone } from "lucide-react";

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

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Privacy Policy — GoTravel Asia";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/5 border-b border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective immediately
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <p className="text-muted-foreground leading-relaxed mb-10 p-4 bg-muted/30 rounded-lg border border-border text-sm">
          GoTravel Asia (<a href={SITE_URL} className="text-primary underline">{SITE_URL}</a>) is
          committed to protecting your privacy. This policy explains what data we collect, how we
          use it, and your rights regarding your personal information.
        </p>

        <Section icon={<Database className="w-4 h-4" />} title="Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Email address</strong> — when you subscribe to our newsletter or set up flight price alerts.</li>
            <li><strong>Flight search preferences</strong> — origin, destination, dates, and target prices you enter for price tracking.</li>
            <li><strong>Usage data</strong> — pages visited, buttons clicked, and general browsing behavior (via analytics).</li>
            <li><strong>Device/browser info</strong> — browser type, operating system, and IP address (collected automatically).</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> collect payment information. All bookings are handled directly by third-party providers (e.g., 12Go.asia, airline websites).</p>
        </Section>

        <Section icon={<Eye className="w-4 h-4" />} title="How We Use Your Information">
          <p>Your information is used solely to provide and improve our services:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Sending flight price alert emails when prices drop to your target.</li>
            <li>Sending newsletter emails with travel deals across Southeast Asia.</li>
            <li>Improving website content and user experience through analytics.</li>
            <li>Preventing abuse and ensuring site security.</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </Section>

        <Section icon={<Globe className="w-4 h-4" />} title="Third-Party Services">
          <p>We use the following third-party services that may process your data:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Resend</strong> — email delivery service for newsletters and alerts.</li>
            <li><strong>PlanetScale / MySQL</strong> — database for storing subscriber and alert data.</li>
            <li><strong>Vercel</strong> — website hosting and serverless functions.</li>
            <li><strong>12Go.asia</strong> — affiliate transport booking links (we earn a small commission).</li>
            <li><strong>Travelpayouts</strong> — flight price data API.</li>
          </ul>
          <p className="mt-3">Each third-party service has its own privacy policy. We encourage you to review them.</p>
        </Section>

        <Section icon={<RefreshCw className="w-4 h-4" />} title="Data Retention">
          <p>We retain your data as long as necessary to provide our services:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Newsletter subscribers</strong> — until you unsubscribe.</li>
            <li><strong>Price alerts</strong> — until the alert is fulfilled or you cancel it.</li>
            <li><strong>Analytics data</strong> — aggregated and anonymized, retained indefinitely.</li>
          </ul>
        </Section>

        <Section icon={<UserX className="w-4 h-4" />} title="Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Access</strong> — request a copy of your personal data we hold.</li>
            <li><strong>Deletion</strong> — request that we delete your data from our systems.</li>
            <li><strong>Unsubscribe</strong> — opt out of emails at any time via the unsubscribe link in any email.</li>
            <li><strong>Correction</strong> — request correction of inaccurate data.</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>.</p>
        </Section>

        <Section icon={<Shield className="w-4 h-4" />} title="Cookies">
          <p>GoTravel Asia uses minimal cookies:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Session cookies</strong> — for authentication if you are logged in.</li>
            <li><strong>Analytics cookies</strong> — to understand how visitors use the site.</li>
          </ul>
          <p className="mt-3">You can disable cookies in your browser settings. Some site features may not work correctly without cookies.</p>
        </Section>

        <Section icon={<Phone className="w-4 h-4" />} title="Contact Us">
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
            <p><strong>GoTravel Asia</strong></p>
            <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a></p>
            <p>Website: <a href={SITE_URL} className="text-primary underline">{SITE_URL}</a></p>
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center pb-12">
          <p>This Privacy Policy was last updated on {LAST_UPDATED}. We reserve the right to update this policy at any time. Continued use of the site constitutes acceptance of any changes.</p>
        </div>
      </div>
    </div>
  );
}
