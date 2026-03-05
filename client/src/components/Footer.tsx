/**
 * @file Footer.tsx
 * @description Premium GoTravel Asia footer with newsletter, SEO destinations,
 * and FlightSearchContext integration.
 */

import { useState, useCallback } from "react";
import { Link } from "wouter";
import { AIRPORTS } from "@/components/flights/flightWidget.data";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AFFILIATE } from "@/lib/config";

// ── Destination Data (derived from flightWidget.data.ts) ──────────────────────
const POPULAR_DESTINATIONS = AIRPORTS.filter(
    (a) => (a as any).isPopular || a.country === "Myanmar"
);
const COUNTRIES = [...new Set(AIRPORTS.map((a) => a.country))];

const EXPLORE_CITIES = [
    { code: "BKK", name: "Bangkok", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "SIN", name: "Singapore", country: "Singapore" },
    { code: "DPS", name: "Bali", country: "Indonesia" },
    { code: "TYO", name: "Tokyo", country: "Japan" },
];

// ── Newsletter Handler ──────────────────────────────────────────────────────
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

// ── Mobile Accordion Column ─────────────────────────────────────────────────
function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <div
                className="text-[11px] font-bold uppercase tracking-[2px] mb-5 pb-3 border-b border-white/[0.08] flex items-center justify-between cursor-pointer sm:cursor-default"
                style={{ color: "#F5C518" }}
                onClick={() => setOpen((p) => !p)}
            >
                {title}
                <span
                    className="sm:hidden text-[10px] transition-transform duration-200"
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        color: "rgba(255,255,255,0.4)",
                    }}
                >
                    ▼
                </span>
            </div>
            <div
                className="flex flex-col gap-2.5 overflow-hidden transition-all duration-300 sm:max-h-[500px]"
                style={{ maxHeight: open ? "300px" : "0px" }}
            >
                {children}
            </div>
        </div>
    );
}

// ── Social Icon Button ──────────────────────────────────────────────────────
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
            className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-all no-underline hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.4)]"
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

// ── Footer Link ─────────────────────────────────────────────────────────────
function FooterLink({
    href,
    children,
    external,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    external?: boolean;
    onClick?: () => void;
}) {
    const cls =
        "text-[13px] no-underline transition-colors hover:text-white relative group";
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
        <Link href={href} className={cls} style={style} onClick={onClick}>
            {children}
        </Link>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Footer() {
    const { setDestination } = useFlightSearch();
    const [nlStatus, setNlStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
    const [nlEmail, setNlEmail] = useState("");

    // Pre-fill flight search destination from footer link click
    const prefillDest = useCallback(
        (code: string, name: string, country: string) => {
            setDestination({ code, name, country });
        },
        [setDestination]
    );

    // Newsletter submit
    const handleNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nlEmail.trim() || nlStatus === "sending") return;

        setNlStatus("sending");
        const ok = await subscribeNewsletter(nlEmail.trim());
        setNlStatus(ok ? "done" : "error");

        if (ok) {
            setTimeout(() => {
                setNlStatus("idle");
                setNlEmail("");
            }, 3000);
        }
    };

    return (
        <footer
            className="relative overflow-hidden"
            style={{
                background: "#2a0050",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            }}
        >
            {/* Background glow orb */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(120,40,200,0.18) 0%, transparent 70%)",
                    top: -200,
                    left: -150,
                }}
            />

            {/* ── ① Newsletter Banner ────────────────────────────────── */}
            <div
                className="border-b border-white/[0.08]"
                style={{
                    background:
                        "linear-gradient(135deg, #5a0099 0%, #7000bb 100%)",
                }}
            >
                <div className="container max-w-[1100px] mx-auto py-7 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3
                            className="text-[18px] font-bold mb-1"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                color: "#FFD700",
                            }}
                        >
                            ✈ Get flight deals first
                        </h3>
                        <p
                            className="text-[13px]"
                            style={{ color: "rgba(255,255,255,0.75)" }}
                        >
                            Join 50,000+ travelers — we send only the best deals, no
                            spam.
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
                            className="py-[11px] px-[18px] border-none outline-none text-sm text-white w-[200px] sm:w-[240px]"
                            style={{
                                background: "rgba(255,255,255,0.12)",
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={nlStatus === "sending"}
                            className="py-[11px] px-[22px] border-none cursor-pointer text-[13px] font-bold tracking-wide transition-colors"
                            style={{
                                background:
                                    nlStatus === "done"
                                        ? "#00cc88"
                                        : nlStatus === "error"
                                            ? "#ff4444"
                                            : "#FFD700",
                                color:
                                    nlStatus === "done" || nlStatus === "error"
                                        ? "#fff"
                                        : "#2a0050",
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            {nlStatus === "sending"
                                ? "..."
                                : nlStatus === "done"
                                    ? "✓ Done!"
                                    : nlStatus === "error"
                                        ? "Try again"
                                        : "Subscribe"}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── ② Main Navigation Grid ─────────────────────────────── */}
            <div className="container max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 px-6 sm:px-12 relative z-10">
                {/* Brand Column */}
                <div>
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 mb-4 no-underline"
                    >
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
                    <p
                        className="text-[13px] leading-relaxed mb-5 max-w-[220px]"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                        Your trusted companion for affordable flights across
                        Southeast Asia and beyond.
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-2.5 mt-5">
                        <SocialBtn
                            href="https://facebook.com/gotravelasia"
                            label="Facebook"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </SocialBtn>
                        <SocialBtn
                            href="https://instagram.com/gotravelasia"
                            label="Instagram"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </SocialBtn>
                        <SocialBtn
                            href="https://twitter.com/gotravelasia"
                            label="X (Twitter)"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </SocialBtn>
                    </div>
                </div>

                {/* Flights Column */}
                <FooterColumn title="Flights">
                    <FooterLink href="/#flights">Cheap flights</FooterLink>
                    <FooterLink href="/#flights">
                        Last minute flights{" "}
                        <span className="text-[9px] font-bold bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-1 uppercase">
                            HOT
                        </span>
                    </FooterLink>
                    <FooterLink href="/#flights">Business class</FooterLink>
                    <FooterLink href="/#flights">Direct flights</FooterLink>
                    <FooterLink href="/#flights">Weekend getaways</FooterLink>
                    <FooterLink href="/#flights">
                        Flight deals{" "}
                        <span className="text-[9px] font-bold bg-[#FFD700] text-[#2a0050] px-1.5 py-0.5 rounded ml-1 uppercase">
                            NEW
                        </span>
                    </FooterLink>
                </FooterColumn>

                {/* Explore Column — from flightWidget.data.ts */}
                <FooterColumn title="Explore">
                    {EXPLORE_CITIES.map((city) => (
                        <FooterLink
                            key={city.code}
                            href="/#flights"
                            onClick={() =>
                                prefillDest(city.code, city.name, city.country)
                            }
                        >
                            Flights to {city.name}
                        </FooterLink>
                    ))}
                </FooterColumn>

                {/* Company Column */}
                <FooterColumn title="Company">
                    <FooterLink href="/blog">Travel Blog</FooterLink>
                    <FooterLink href="/faq">FAQ</FooterLink>
                    <FooterLink href="/contact">Contact Us</FooterLink>
                    <FooterLink href="/about">About Us</FooterLink>
                    <FooterLink href={AFFILIATE.AIRALO_URL} external>
                        Travel eSIM — Airalo
                    </FooterLink>
                </FooterColumn>
            </div>

            {/* ── ③ SEO Destinations Grid ────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-9 px-6 sm:px-12">
                    {/* Popular Countries */}
                    <div className="mb-7">
                        <p
                            className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                            Popular destinations
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5">
                            {COUNTRIES.filter((c) => c !== "Myanmar").map(
                                (country) => (
                                    <Link
                                        key={country}
                                        href="/#flights"
                                        className="text-[13px] font-medium no-underline transition-colors hover:text-[#FFD700] truncate"
                                        style={{ color: "#7b5baa" }}
                                    >
                                        Flights to {country}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Popular Cities */}
                    <div>
                        <p
                            className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                            Popular cities
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5">
                            {POPULAR_DESTINATIONS.map((airport) => (
                                <Link
                                    key={airport.code}
                                    href="/#flights"
                                    className="text-[13px] font-medium no-underline transition-colors hover:text-[#FFD700] truncate"
                                    style={{ color: "#7b5baa" }}
                                    onClick={() =>
                                        prefillDest(
                                            airport.code,
                                            airport.name,
                                            airport.country
                                        )
                                    }
                                >
                                    Flights to {airport.name.replace(/\s*\(.*?\)\s*/g, "")}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Partner Logos Row ───────────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-6 px-6 sm:px-12 flex items-center gap-4 flex-wrap">
                    <span
                        className="text-[11px] font-semibold uppercase tracking-wide shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                        Trusted partners
                    </span>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            "Aviasales",
                            "Agoda",
                            "Trip.com",
                            "12Go Asia",
                            "Klook",
                            "Airalo",
                            "Travelpayouts",
                        ].map((name) => (
                            <span
                                key={name}
                                className="text-xs font-bold rounded-md px-3 py-1.5 cursor-default"
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
            </div>

            {/* ── ④ Bottom Bar ───────────────────────────────────────── */}
            <div className="border-t border-white/[0.08] relative z-10">
                <div className="container max-w-[1100px] mx-auto py-5 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-0 flex-wrap">
                        {[
                            { label: "Privacy Policy", href: "/privacy" },
                            { label: "Terms of Use", href: "/terms" },
                            { label: "Cookie Settings", href: "/cookies" },
                            { label: "Sitemap", href: "/sitemap.xml" },
                        ].map((link, i, arr) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-xs no-underline px-3 transition-colors hover:text-white/70"
                                style={{
                                    color: "rgba(255,255,255,0.4)",
                                    paddingLeft: i === 0 ? 0 : undefined,
                                    borderRight:
                                        i < arr.length - 1
                                            ? "1px solid rgba(255,255,255,0.15)"
                                            : "none",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                        © 2026 GoTravel Asia. All rights reserved. | Made with ♥
                        for Asian travelers.
                    </span>
                </div>
            </div>
        </footer>
    );
}
