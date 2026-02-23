import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import StickyCTA from "./StickyCTA";
import FloatingSearchBar from "./FloatingSearchBar";
import MobileNav from "./MobileNav";
import CookieConsent from "./CookieConsent";
import { Button } from "@/components/ui/button";
// Language switcher removed — English-only for international Asia market
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
      {/* Header — Cheapflights style */}
      <header className="sticky top-0 z-50 bg-primary shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <MobileNav onPlanTrip={() => setChatOpen(true)} />
            <Link href="/" className="flex items-center">
              <img src="/logo.webp" alt="GoTravel Logo" className="h-[40px] w-auto object-contain brightness-0 invert" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <SignInModal variant="header" />
          </div>
        </div>
      </header>

      {/* AI Trip Planner Chat */}
      <TripPlannerChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <FloatingSearchBar />
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
              Compare cheap flights, hotels, buses and trains across Southeast Asia. Book smart, travel more.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">Destinations</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/thailand/bangkok" className="hover:underline">Bangkok</Link></li>
              <li><Link href="/thailand/chiang-mai" className="hover:underline">Chiang Mai</Link></li>
              <li><Link href="/thailand/phuket" className="hover:underline">Phuket</Link></li>
              <li><Link href="/thailand/krabi" className="hover:underline">Krabi</Link></li>
              <li><Link href="/thailand/pai" className="hover:underline">Pai</Link></li>
              <li><Link href="/thailand/chiang-rai" className="hover:underline">Chiang Rai</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/blog" className="hover:underline">Travel Blog</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><a href="https://www.airalo.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Travel eSIM — Airalo</a></li>
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
            <p>© 2026 GoTravel Asia — Compare. Book. Travel.</p>
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
