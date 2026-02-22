import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import StickyCTA from "./StickyCTA";
import MobileNav from "./MobileNav";
import CookieConsent from "./CookieConsent";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import SignInModal from "./SignInModal";
import TripPlannerChat from "./TripPlannerChat";
import { Loader2 } from "lucide-react";
import { WEB3FORMS_KEY } from "@/lib/config";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [footerEmail, setFooterEmail] = useState("");
  const [footerStatus, setFooterStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [chatOpen, setChatOpen] = useState(false);

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail) return;
    setFooterStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "📬 Newsletter Subscriber — GoTravelAsia",
          from_name: "GoTravel Newsletter",
          email: footerEmail,
          message: `Newsletter subscriber: ${footerEmail}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      localStorage.setItem("gt_user_email", footerEmail);
      localStorage.setItem("gt_subscribed", "true");
      setFooterStatus("done");
    } catch {
      setFooterStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.webp" alt="GoTravel Logo" className="h-[50px] w-auto object-contain" />
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground leading-none">Travel Guides • Stays • Experiences</span>
            </div>
          </Link>

          <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
            <Link href="/thailand/chiang-mai" className="hover:text-primary transition-colors">{t("destinations.chiangMai")}</Link>
            <Link href="/thailand/bangkok" className="hover:text-primary transition-colors">{t("destinations.bangkok")}</Link>
            <Link href="/thailand/phuket" className="hover:text-primary transition-colors">{t("destinations.phuket")}</Link>
            <Link href="/thailand/krabi" className="hover:text-primary transition-colors">{t("destinations.krabi")}</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">{t("nav.blog")}</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Price Alerts (was "Sign In") */}
            <SignInModal variant="header" />
            {/* Plan Trip — opens AI chat */}
            <Button
              className="hidden sm:inline-flex font-mono text-xs uppercase tracking-wider bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors"
              onClick={() => setChatOpen(true)}
            >
              {t("cta.planTrip")}
            </Button>
            {/* Mobile Navigation */}
            <MobileNav onPlanTrip={() => setChatOpen(true)} />
          </div>
        </div>
      </header>

      {/* AI Trip Planner Chat */}
      <TripPlannerChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <StickyCTA />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="block mb-4">
              <img src="/logo.webp" alt="GoTravel Logo" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thailand Travel Guides & Planning for Myanmar and International Travelers. Crafting Unforgettable Journeys.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">{t("sections.featuredDestinations")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/thailand/chiang-mai" className="hover:underline">{t("destinations.chiangMai")}</Link></li>
              <li><Link href="/thailand/bangkok" className="hover:underline">{t("destinations.bangkok")}</Link></li>
              <li><Link href="/thailand/phuket" className="hover:underline">{t("destinations.phuket")}</Link></li>
              <li><Link href="/thailand/krabi" className="hover:underline">{t("destinations.krabi")}</Link></li>
              <li><Link href="/thailand/pai" className="hover:underline">{t("destinations.pai")}</Link></li>
              <li><Link href="/thailand/chiang-rai" className="hover:underline">{t("destinations.chiangRai")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="hover:underline">{t("footer.contactUs")}</Link></li>
              <li><Link href="/privacy" className="hover:underline">{t("footer.privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="hover:underline">{t("footer.termsOfService")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">{t("footer.newsletterTitle")}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.newsletterDesc")}
            </p>
            {footerStatus === "done" ? (
              <p className="text-sm text-green-600 font-medium">Subscribed! Check your inbox.</p>
            ) : footerStatus === "error" ? (
              <p className="text-sm text-red-500 font-medium">Something went wrong. Please try again later.</p>
            ) : (
              <form className="flex gap-2" onSubmit={handleFooterSubscribe}>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder={t("footer.enterEmail")}
                  required
                  className="flex h-9 w-full rounded-none border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={footerStatus === "sending"}
                  className="rounded-none bg-primary text-primary-foreground"
                >
                  {footerStatus === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("footer.subscribe")
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="container mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
          <p className="mb-4">
            <strong>Disclosure:</strong> {t("footer.affiliateDisclosure")}
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
            <p>© 2026 GoTravel — Crafting Unforgettable Journeys</p>
            <div className="flex gap-4">
              <a href="https://instagram.com/gotravelasia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Instagram</a>
              <a href="https://twitter.com/gotravelasia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <a href="https://facebook.com/gotravelasia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
