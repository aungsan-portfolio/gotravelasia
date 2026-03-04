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
          <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out ${searchVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}`}>
            <FloatingSearchBar />
          </div>

          <div className="flex items-center gap-3 relative z-10 w-[200px] justify-end">
            <SignInModal variant="header" autoOpen />
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
                  {
                    label: "Facebook",
                    href: "https://facebook.com/gotravelasia",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Instagram",
                    href: "https://instagram.com/gotravelasia",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    ),
                  },
                  {
                    label: "LINE",
                    href: "#",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.084l-.171 1.028c-.052.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.107 14.471 24 12.494 24 10.304zM8.558 13.303H6.726a.612.612 0 01-.612-.612V9.093a.612.612 0 111.224 0v2.986h1.22a.612.612 0 010 1.224zm2.1-.612a.612.612 0 11-1.224 0V9.093a.612.612 0 111.224 0v3.598zm5.07 0a.612.612 0 01-1.097.377L12.745 10.7v1.991a.612.612 0 11-1.224 0V9.093a.612.612 0 011.097-.377l1.886 2.368V9.093a.612.612 0 111.224 0v3.598zm3.478-2.374a.612.612 0 010 1.224h-1.22v.538h1.22a.612.612 0 010 1.224H17.37a.612.612 0 01-.612-.612V9.093a.612.612 0 01.612-.612h1.836a.612.612 0 010 1.224h-1.22v.612h1.22z" />
                      </svg>
                    ),
                  },
                  {
                    label: "X (Twitter)",
                    href: "https://twitter.com/gotravelasia",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
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
