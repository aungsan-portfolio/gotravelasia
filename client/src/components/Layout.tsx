import { useState, useEffect } from "react";
import { Link } from "wouter";
import StickyCTA from "./StickyCTA";
import FloatingSearchBar from "./FloatingSearchBar";
import MobileNav from "./MobileNav";
import CookieConsent from "./CookieConsent";
// Language switcher removed — English-only for international Asia market
import SignInModal from "./SignInModal";
import TripPlannerChat from "./TripPlannerChat";
import { AFFILIATE } from "@/lib/config";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Custom observer to show inline search bar when scrolling past widget
  useEffect(() => {
    const mainWidget = document.getElementById("mainWidget");
    if (!mainWidget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setSearchVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(mainWidget);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Header — Gold */}
      <header
        className="sticky top-0 z-50 bg-[#F5C518] border-b border-gray-200 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <div className="container flex h-14 items-center justify-between relative">
          <div className="flex items-center gap-3 relative z-10 w-[200px]">
            {/* Hamburger Menu */}
            <MobileNav onPlanTrip={() => setChatOpen(true)} />
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="GoTravel Logo" className="h-[36px] w-auto object-contain" />
              <span className="font-extrabold text-[#5B0EA6] text-xl tracking-tight hidden sm:inline-block">
                GO TRAVEL
              </span>
            </Link>
          </div>

          {/* Embedded Floating Search Bar */}
          <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out hidden md:block ${searchVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}`}>
            <FloatingSearchBar />
          </div>

          <div className="flex items-center gap-3 relative z-10 w-[200px] justify-end">
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

      <StickyCTA />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer
        className="pt-12"
        style={{
          background: "#2d0560",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        }}
      >
        <div className="container">
          {/* ── Top Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">

            {/* Brand column */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4 no-underline">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: "#F5C518" }}
                >
                  ✈
                </div>
                <span className="text-[17px] font-extrabold text-white tracking-tight">
                  Go<span style={{ color: "#F5C518" }}>Travel</span> Asia
                </span>
              </Link>
              <p className="text-[13px] leading-relaxed mb-5 max-w-[220px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Crafting unforgettable journeys across Southeast Asia since 2024.
              </p>

              {/* Social icons */}
              <div className="flex gap-2.5 mt-5">
                {[
                  { label: "Facebook", icon: "f", href: "https://facebook.com/gotravelasia" },
                  { label: "Instagram", icon: "ig", href: "https://instagram.com/gotravelasia" },
                  { label: "LINE", icon: "L", href: "#" },
                  { label: "Twitter/X", icon: "𝕏", href: "https://twitter.com/gotravelasia" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm transition-all no-underline"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(245,197,24,0.15)";
                      e.currentTarget.style.borderColor = "rgba(245,197,24,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Flights column */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F5C518" }}>
                Flights
              </div>
              <div className="flex flex-col gap-2.5">
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Cheap flights</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Last minute flights</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Business class flights</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Direct flights</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Weekend getaways</Link>
              </div>
            </div>

            {/* Explore column */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F5C518" }}>
                Explore
              </div>
              <div className="flex flex-col gap-2.5">
                <Link href="/thailand/bangkok" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Bangkok</Link>
                <Link href="/thailand/phuket" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Phuket</Link>
                <Link href="/thailand/chiang-mai" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Chiang Mai</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Singapore</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Bali</Link>
                <Link href="/#flights" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Flights to Japan</Link>
              </div>
            </div>

            {/* Company column */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F5C518" }}>
                Company
              </div>
              <div className="flex flex-col gap-2.5">
                <Link href="/blog" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Travel Blog</Link>
                <Link href="/faq" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>FAQ</Link>
                <Link href="/contact" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Contact Us</Link>
                <a href={AFFILIATE.AIRALO_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] no-underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>Travel eSIM — Airalo</a>
              </div>
            </div>

          </div>

          {/* ── Partner Logos Row ─────────────────────────────────── */}
          <div className="py-6 border-b border-white/[0.08] flex items-center gap-4 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wide shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
              Trusted partners
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {["Aviasales", "Agoda", "Trip.com", "12Go Asia", "Klook", "Airalo", "Travelpayouts"].map((name) => (
                <span
                  key={name}
                  className="text-xs font-bold rounded-md px-3 py-1.5 transition-all cursor-default"
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* ── Bottom Bar ───────────────────────────────────────── */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-0 flex-wrap">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use", href: "/terms" },
              ].map((link, i, arr) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs no-underline px-3 transition-colors hover:text-white/70"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    paddingLeft: i === 0 ? 0 : undefined,
                    borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2025 GoTravel Asia. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
