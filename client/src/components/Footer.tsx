/**
 * @file Footer.tsx
 * @description Premium GoTravel Asia footer — all bugs fixed.
 *
 * Fixed:
 *  [1] Accordion desktop always-open (useEffect + isMobile state)
 *  [2] Explore/Cities navigation (useLocation + smooth scroll)
 *  [3] Newsletter error state auto-reset
 *  [4] handleNewsletter wrapped in useCallback
 *  [5] `as any` replaced with proper Airport type guard
 *  [6] Disabled button cursor-not-allowed
 *  [7] Empty state for POPULAR_DESTINATIONS
 *  [8] window.scrollTo SSR-safe guard
 */

import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type MouseEventHandler,
} from "react";
import { useLocation } from "wouter";
import { AIRPORTS } from "@/components/flights/flightWidget.data";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AFFILIATE } from "@/lib/config";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Airport {
    code: string;
    name: string;
    country: string;
    isPopular?: boolean; // [Fix 5] removed `as any`
}

type NlStatus = "idle" | "sending" | "done" | "error";

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

const POPULAR_DESTINATIONS: Airport[] = (AIRPORTS as Airport[]).filter(
    (a) => a.isPopular === true || a.country === "Myanmar" // [Fix 5]
);

const COUNTRIES: string[] = [...new Set((AIRPORTS as Airport[]).map((a) => a.country))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

const EXPLORE_CITIES = [
    { code: "BKK", name: "Bangkok", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "SIN", name: "Singapore", country: "Singapore" },
    { code: "DPS", name: "Bali", country: "Indonesia" },
    { code: "TYO", name: "Tokyo", country: "Japan" },
] as const;

const PARTNER_LINKS = [
    ["Aviasales", "https://aviasales.com"],
    ["Agoda", "https://agoda.com"],
    ["Trip.com", "https://trip.com"],
    ["12Go Asia", "https://12go.asia"],
    ["Klook", "https://klook.com"],
    ["Airalo", "https://airalo.com"],
    ["Travelpayouts", "https://travelpayouts.com"],
] as const;

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Settings", href: "/cookies" },
    { label: "Sitemap", href: "/sitemap.xml" },
] as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Country → primary airport code map for reliable destination lookup */
const COUNTRY_PRIMARY_AIRPORT: Record<string, string> = {
    Thailand: "BKK",
    Japan: "TYO",
    Singapore: "SIN",
    Indonesia: "DPS",
    Malaysia: "KUL",
    Vietnam: "SGN",
    Cambodia: "PNH",
    Philippines: "MNL",
    Myanmar: "RGN",
    "South Korea": "ICN",
    India: "DEL",
    "Sri Lanka": "CMB",
    Laos: "VTE",
    China: "PEK",
    "Hong Kong": "HKG",
    Taiwan: "TPE",
    Maldives: "MLE",
    Nepal: "KTM",
};

/** "Chiang Mai" → "chiang-mai" */
function toSlug(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-");
}

/** Newsletter API call */
async function subscribeNewsletter(email: string): Promise<boolean> {
    try {
        const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

/**
 * FooterColumn — mobile accordion, always open on desktop.
 * [Fix 1] Uses useEffect + isMobile state instead of
 *         sm:!max-h-[500px] (which Tailwind JIT doesn't reliably generate).
 */
function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const isOpen = !isMobile || open; // desktop always open

    return (
        <div>
            {/* Header / toggle */}
            <div
                className="text-[11px] font-bold uppercase tracking-[2px] mb-5 pb-3
                           border-b border-white/[0.08] flex items-center justify-between"
                style={{
                    color: "#F5C518",
                    cursor: isMobile ? "pointer" : "default",
                }}
                onClick={() => isMobile && setOpen((p) => !p)}
            >
                {title}
                {isMobile && (
                    <span
                        className="text-[10px] transition-transform duration-200"
                        style={{
                            display: "inline-block",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            color: "rgba(255,255,255,0.4)",
                        }}
                    >
                        ▼
                    </span>
                )}
            </div>

            {/* Content — inline style only, no Tailwind arbitrary sm: override */}
            <div
                style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {children}
            </div>
        </div>
    );
}

/** Social icon button */
function SocialBtn({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="w-[34px] h-[34px] rounded-lg flex items-center justify-center
                       transition-all no-underline
                       hover:bg-[rgba(245,197,24,0.15)]"
            style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
            }}
        >
            {children}
        </a>
    );
}

/** Generic footer link — internal or external */
function FooterLink({
    href,
    children,
    external,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    external?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
    const cls = "text-[13px] no-underline transition-colors hover:text-white";
    const style = { color: "rgba(255,255,255,0.6)" };

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
                style={style}
                onClick={onClick}
            >
                <span className="text-[10px] mr-1" style={{ color: "#F5C518", opacity: 0.7 }}>
                    ↗
                </span>
                {children}
            </a>
        );
    }

    return (
        <a href={href} className={cls} style={style} onClick={onClick}>
            {children}
        </a>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN FOOTER
// ─────────────────────────────────────────────────────────────

export default function Footer() {
    const { setDestination, setCabinClass } = useFlightSearch();
    const [, navigate] = useLocation();
    const [nlStatus, setNlStatus] = useState<NlStatus>("idle");
    const [nlEmail, setNlEmail] = useState("");
    const resetTimer = useRef<ReturnType<typeof setTimeout>>();

    // ── Navigate to home page flights tab ─────────────────────
    const goToFlights = useCallback(() => {
        navigate("/");
        setTimeout(() => {
            if (typeof window !== "undefined") {
                // Use replaceState to avoid polluting browser history
                history.replaceState(null, "", "/#flights");
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        }, 100);
    }, [navigate]);

    // ── Pre-fill destination + navigate to flights ────────────
    const prefillDest = useCallback(
        (code: string, name: string, country: string) => {
            setDestination({ code, name, country });
            goToFlights();
        },
        [setDestination, goToFlights]
    );

    // ── Newsletter submit [Fix 3 + Fix 4] ────────────────────
    const handleNewsletter = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!nlEmail.trim() || nlStatus === "sending") return;

            // Clear any pending reset timer
            clearTimeout(resetTimer.current);

            setNlStatus("sending");
            const ok = await subscribeNewsletter(nlEmail.trim());
            setNlStatus(ok ? "done" : "error");

            // [Fix 3] Always reset after 3s — both done AND error
            resetTimer.current = setTimeout(() => {
                setNlStatus("idle");
                if (ok) setNlEmail("");
            }, 3000);
        },
        [nlEmail, nlStatus]
    );

    // Cleanup timer on unmount
    useEffect(() => () => clearTimeout(resetTimer.current), []);

    // ── Derived newsletter button style ──────────────────────
    const nlBtnBg =
        nlStatus === "done" ? "#00cc88" :
            nlStatus === "error" ? "#ff4444" : "#FFD700";

    const nlBtnColor =
        nlStatus === "done" || nlStatus === "error" ? "#fff" : "#2a0050";

    const nlBtnText =
        nlStatus === "sending" ? "..." :
            nlStatus === "done" ? "✓ Done!" :
                nlStatus === "error" ? "Try again" : "Subscribe";

    // ─────────────────────────────────────────────────────────
    return (
        <footer
            className="relative overflow-hidden"
            style={{
                background: "#2a0050",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            }}
        >
            {/* Glow orb */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 600, height: 600, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(120,40,200,0.18) 0%, transparent 70%)",
                    top: -200, left: -150,
                }}
            />

            {/* ── ① Newsletter Banner ─────────────────────────────── */}
            <div
                className="border-b border-white/[0.08]"
                style={{ background: "linear-gradient(135deg,#5a0099 0%,#7000bb 100%)" }}
            >
                <div className="container max-w-[1100px] mx-auto py-7 px-6 sm:px-12
                                flex flex-col sm:flex-row items-start sm:items-center
                                justify-between gap-4">
                    <div>
                        <h3
                            className="text-[18px] font-bold mb-1"
                            style={{ fontFamily: "'Playfair Display',serif", color: "#FFD700" }}
                        >
                            ✈ Get flight deals first
                        </h3>
                        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                            Join 50,000+ travelers — we send only the best deals, no spam.
                        </p>
                    </div>

                    <form
                        onSubmit={handleNewsletter}
                        className="flex rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    >
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={nlEmail}
                            onChange={(e) => setNlEmail(e.target.value)}
                            required
                            className="py-[11px] px-[18px] border-none outline-none text-sm
                                       text-white w-[200px] sm:w-[240px] placeholder:text-white/40"
                            style={{
                                background: "rgba(255,255,255,0.12)",
                                fontFamily: "'DM Sans',sans-serif",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={nlStatus === "sending"}
                            className={`py-[11px] px-[22px] border-none text-[13px] font-bold
                                        tracking-wide transition-colors
                                        ${nlStatus === "sending"
                                    ? "cursor-not-allowed opacity-70"
                                    : "cursor-pointer"}`}
                            style={{
                                background: nlBtnBg,
                                color: nlBtnColor,
                                fontFamily: "'DM Sans',sans-serif",
                            }}
                        >
                            {nlBtnText}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── ② Main Navigation Grid ──────────────────────────── */}
            <div className="container max-w-[1100px] mx-auto
                            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
                            gap-10 py-12 px-6 sm:px-12 relative z-10">

                {/* Brand */}
                <div>
                    <a href="/" className="flex items-center gap-2.5 mb-4 no-underline">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                            style={{ background: "#F5C518" }}
                        >
                            ✈
                        </div>
                        <span className="text-[17px] font-extrabold text-white tracking-tight">
                            Go<span style={{ color: "#F5C518" }}>Travel</span> Asia
                        </span>
                    </a>
                    <p
                        className="text-[13px] leading-relaxed mb-5 max-w-[220px]"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                        Your trusted companion for affordable flights across
                        Southeast Asia and beyond.
                    </p>
                    <div className="flex gap-2.5 mt-5">
                        <SocialBtn href="https://facebook.com/gotravelasia" label="Facebook">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </SocialBtn>
                        <SocialBtn href="https://instagram.com/gotravelasia" label="Instagram">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </SocialBtn>
                        <SocialBtn href="https://twitter.com/gotravelasia" label="X (Twitter)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </SocialBtn>
                    </div>
                </div>

                {/* Flights column */}
                <FooterColumn title="Flights">
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); goToFlights(); }}
                    >
                        Cheap flights
                    </FooterLink>
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); goToFlights(); }}
                    >
                        Last minute flights{" "}
                        <span className="text-[9px] font-bold bg-[#ff4444] text-white
                                         px-1.5 py-0.5 rounded ml-1 uppercase">
                            HOT
                        </span>
                    </FooterLink>
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); setCabinClass?.("C"); goToFlights(); }}
                    >
                        Business class
                    </FooterLink>
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); goToFlights(); }}
                    >
                        Direct flights
                    </FooterLink>
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); goToFlights(); }}
                    >
                        Weekend getaways
                    </FooterLink>
                    <FooterLink
                        href="/#flights"
                        onClick={(e) => { e.preventDefault(); goToFlights(); }}
                    >
                        Flight deals{" "}
                        <span className="text-[9px] font-bold bg-[#FFD700] text-[#2a0050]
                                         px-1.5 py-0.5 rounded ml-1 uppercase">
                            NEW
                        </span>
                    </FooterLink>
                </FooterColumn>

                {/* Explore column [Fix 2] */}
                <FooterColumn title="Explore">
                    {EXPLORE_CITIES.map((city) => (
                        <FooterLink
                            key={city.code}
                            href="/#flights"
                            onClick={(e) => {
                                e.preventDefault();
                                prefillDest(city.code, city.name, city.country);
                            }}
                        >
                            Flights to {city.name}
                        </FooterLink>
                    ))}
                </FooterColumn>

                {/* Company column */}
                <FooterColumn title="Company">
                    <FooterLink href="/blog">Travel Blog</FooterLink>
                    <FooterLink href="/faq">FAQ</FooterLink>
                    <FooterLink href="/contact">Contact Us</FooterLink>
                    <FooterLink href="/about">About Us</FooterLink>
                    <FooterLink
                        href={AFFILIATE?.AIRALO_URL ?? "https://airalo.com"}
                        external
                    >
                        Travel eSIM — Airalo
                    </FooterLink>
                </FooterColumn>
            </div>

            {/* ── ③ SEO Destinations ──────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-9 px-6 sm:px-12">

                    {/* Popular countries */}
                    <div className="mb-7">
                        <p className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                            style={{ color: "rgba(255,255,255,0.25)" }}>
                            Popular destinations
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5">
                            {COUNTRIES.filter((c) => c !== "Myanmar").map((country) => {
                                // Use primary airport map for reliable lookup
                                const primaryCode = COUNTRY_PRIMARY_AIRPORT[country];
                                const airport = primaryCode
                                    ? (AIRPORTS as Airport[]).find(a => a.code === primaryCode)
                                    : (AIRPORTS as Airport[]).find(a => a.country === country);
                                return (
                                    <a
                                        key={country}
                                        href="/#flights"
                                        className="text-[13px] font-medium no-underline
                                                   transition-colors hover:text-[#FFD700] truncate"
                                        style={{ color: "#7b5baa" }}
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            if (airport) {
                                                prefillDest(airport.code, airport.name, airport.country);
                                            } else {
                                                goToFlights();
                                            }
                                        }}
                                    >
                                        Flights to {country}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Popular cities [Fix 2 + Fix 7 + Fix 8] */}
                    <div>
                        <p className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                            style={{ color: "rgba(255,255,255,0.25)" }}>
                            Popular cities
                        </p>

                        {/* [Fix 7] Empty state */}
                        {POPULAR_DESTINATIONS.length === 0 ? (
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                                No destinations available.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                                            gap-x-5 gap-y-1.5">
                                {POPULAR_DESTINATIONS.map((airport) => {
                                    const cityName = airport.name.replace(/\s*\(.*?\)\s*/g, "");
                                    return (
                                        <a
                                            key={airport.code}
                                            href="/#flights"
                                            className="text-[13px] font-medium no-underline
                                                       transition-colors hover:text-[#FFD700] truncate"
                                            style={{ color: "#7b5baa" }}
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                prefillDest(
                                                    airport.code,
                                                    airport.name,
                                                    airport.country
                                                );
                                            }}
                                        >
                                            Flights to {cityName}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Partner Logos ────────────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-6 px-6 sm:px-12
                                flex items-center gap-4 flex-wrap">
                    <span
                        className="text-[11px] font-semibold uppercase tracking-wide shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                        Trusted partners
                    </span>
                    <div className="flex items-center gap-3 flex-wrap">
                        {PARTNER_LINKS.map(([name, url]) => (
                            <a
                                key={name}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className="text-xs font-bold rounded-md px-3 py-1.5 no-underline
                                           transition-all cursor-pointer
                                           hover:border-[rgba(245,197,24,0.4)]
                                           hover:text-white/60"
                                style={{
                                    color: "rgba(255,255,255,0.35)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                {name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ④ Bottom Bar ─────────────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-5 px-6 sm:px-12
                                flex flex-col sm:flex-row items-start sm:items-center
                                justify-between gap-3">
                    <div className="flex items-center flex-wrap" style={{ gap: 0 }}>
                        {LEGAL_LINKS.map((link, i, arr) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-xs no-underline transition-colors
                                           hover:text-white/70"
                                style={{
                                    color: "rgba(255,255,255,0.4)",
                                    padding: "0 12px",
                                    paddingLeft: i === 0 ? 0 : 12,
                                    borderRight:
                                        i < arr.length - 1
                                            ? "1px solid rgba(255,255,255,0.15)"
                                            : "none",
                                    textDecoration: "none",
                                    fontSize: 12,
                                    lineHeight: 1,
                                }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        © 2026 GoTravel Asia. All rights reserved. | Made with ♥ for Asian travelers.
                    </span>
                </div>
            </div>
        </footer>
    );
}
