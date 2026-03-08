"use client";

/**
 * PriceAlertPopup.tsx — GoTravel Asia
 * ─────────────────────────────────────────────────────────────────
 * Two-Flow Smart Popup:
 *  (က) Search context detected → auto-save alert (no questions asked)
 *  (ခ) No context (homepage)   → save email, welcome email sent later
 *
 * Smart Triggers: 30s delay, Exit Intent (Desktop), Scroll-up (Mobile)
 * Auth: Custom Google GSI + Email (no NextAuth)
 * UI: Tailwind CSS + Syne/DM Sans premium design
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    X, Zap, Target, BadgeDollarSign,
    ArrowRight, Mail, Loader2,
    CheckCircle2, AlertCircle, Radio,
} from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";
import { formatTHB } from "@/const";
import {
    detectRouteFromContext,
    clearSearchContext,
    type DetectedRoute,
} from "@/lib/detectRouteFromContext";

// ── Project Constants (Sync with SignInModal) ────────────────────
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";
const LS_MODAL_SHOWN_KEY = "gt_modal_shown";
const LS_POPUP_DISMISSED = "gt_popup_dismissed";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const BENEFITS = [
    { icon: Zap, label: "Real-time alerts before prices spike" },
    { icon: Target, label: "SEA routes tailored to your searches" },
    { icon: BadgeDollarSign, label: "Members save avg. $54 per booking" },
];

const AVATARS = ["KH", "MW", "AS", "NT", "PL"];

// ── Google GSI Helpers ───────────────────────────────────────────
function loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById("google-gsi-script")) { resolve(); return; }
        const s = document.createElement("script");
        s.id = "google-gsi-script";
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(s);
    });
}

function decodeJwt(token: string): { email: string; name: string } | null {
    try {
        const p = token.split(".");
        if (p.length !== 3) return null;
        const payload = JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/")));
        return { email: payload.email || "", name: payload.name || "" };
    } catch { return null; }
}

// ── Types ─────────────────────────────────────────────────────────
type PopupStep = "idle" | "loading" | "auto-saved" | "email-sent" | "error";

// ── Main Component ────────────────────────────────────────────────
export default function PriceAlertPopup() {
    const { deals } = useFlightData();

    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dealIdx, setDealIdx] = useState(0);
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [step, setStep] = useState<PopupStep>("idle");
    const [detectedRoute, setDetectedRoute] = useState<DetectedRoute | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const [signupCount] = useState(Math.floor(Math.random() * 30) + 15);

    const firedRef = useRef(false);

    // ── Smart Trigger Logic ────────────────────────────────────────
    const firePopup = useCallback(() => {
        if (firedRef.current) return;
        const isSubscribed = localStorage.getItem(LS_SUBSCRIBED_KEY) === "true";
        const isDismissed = localStorage.getItem(LS_POPUP_DISMISSED) === "true";
        const isModalShown = localStorage.getItem(LS_MODAL_SHOWN_KEY) === "true";
        if (isSubscribed || isDismissed || isModalShown) return;

        firedRef.current = true;
        setOpen(true);
        setTimeout(() => setMounted(true), 10);
    }, []);

    useEffect(() => {
        const timer = setTimeout(firePopup, 30000);
        const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) firePopup(); };
        document.addEventListener("mouseleave", onLeave);

        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (y < lastY - 100 && y < 300) firePopup();
            lastY = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("scroll", onScroll);
        };
    }, [firePopup]);

    useEffect(() => {
        if (!open || !deals || deals.length === 0) return;
        const id = setInterval(() => setDealIdx((i) => (i + 1) % deals.length), 3000);
        return () => clearInterval(id);
    }, [open, deals]);

    if (!open) return null;

    const currentDeal = deals?.[dealIdx] || { origin: "RGN", destination: "BKK", price: 38 };
    const isSuccess = step === "auto-saved" || step === "email-sent";

    const close = () => {
        setMounted(false);
        localStorage.setItem(LS_POPUP_DISMISSED, "true");
        setTimeout(() => setOpen(false), 400);
    };

    // ── Two-Flow Submit Logic ──────────────────────────────────────
    const submitAlert = async (userEmail: string, source: string) => {
        setStep("loading");

        // (က) Detect route from current page context
        const route = detectRouteFromContext();
        setDetectedRoute(route);

        try {
            const res = await fetch("/api/alerts/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    source,
                    origin: route?.origin ?? undefined,
                    destination: route?.destination ?? undefined,
                    departDate: route?.date ?? undefined,
                    currentPrice: 0,
                    currency: "USD",
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            localStorage.setItem(LS_EMAIL_KEY, userEmail);
            localStorage.setItem(LS_SUBSCRIBED_KEY, "true");

            if (data.flow === "auto-saved" && route) {
                // (က) Route context found → auto-saved alert
                setToastMessage(`✓ Alert set for ${route.label}`);
                setStep("auto-saved");
                clearSearchContext();
            } else {
                // (ခ) No route context → subscriber saved, welcome email sent
                setToastMessage(data.message || "✓ You're in! We'll email you top deals soon.");
                setStep("email-sent");
            }
        } catch {
            setStep("error");
            setToastMessage("Something went wrong. Please try again.");
        }
    };

    // ── Auth Handlers ──────────────────────────────────────────────
    const handleGoogleSignIn = async () => {
        if (!GOOGLE_CLIENT_ID) { setStep("idle"); return; }
        setStep("loading");
        try {
            await loadGoogleScript();
            const google = (window as any).google;
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: { credential: string }) => {
                    const decoded = decodeJwt(response.credential);
                    if (decoded?.email) {
                        await submitAlert(decoded.email, "google_popup");
                    } else {
                        setStep("error");
                    }
                },
            });
            google.accounts.id.prompt();
        } catch {
            setStep("error");
        }
    };

    const handleEmailSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setEmailErr("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr("Please enter a valid email");
            return;
        }
        submitAlert(email, "email_popup");
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && close()}
        >
            <div
                className={`
          relative w-full sm:w-[380px] bg-[#0c051e] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"}
        `}
                style={{
                    background: "linear-gradient(155deg, #180840 0%, #0c051e 55%, #180c38 100%)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                }}
            >
                {/* Glow Effects */}
                <div className="absolute top-0 left-1/4 w-1/2 h-24 bg-amber-400/10 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-1/2 h-24 bg-purple-500/10 blur-[60px] pointer-events-none" />

                {/* Close */}
                <button
                    onClick={close}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/15 transition-all z-10"
                >
                    <X size={16} />
                </button>

                <div className="px-7 pt-8 pb-7">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                        <Radio size={10} className="text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">SEA Travel Update</span>
                    </div>

                    {/* ── SUCCESS STATES ─────────────────────────────── */}
                    {isSuccess ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-400">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5 border border-emerald-500/30">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">You're in!</h2>
                            <p className="text-white/50 text-sm">{toastMessage}</p>

                            {/* (က) Show detected route badge */}
                            {step === "auto-saved" && detectedRoute && (
                                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-emerald-400 text-xs font-semibold">{detectedRoute.label}</span>
                                </div>
                            )}

                            {/* (ခ) Show inbox instruction */}
                            {step === "email-sent" && (
                                <p className="text-white/30 text-xs mt-3">Check your inbox → pick your routes</p>
                            )}

                            <button
                                onClick={close}
                                className="mt-8 w-full flex items-center justify-center px-4 py-3 bg-amber-400 text-[#2D0558] hover:bg-amber-500 font-bold h-12 rounded-xl transition-all active:scale-[0.98]"
                            >
                                Got it, thanks!
                            </button>
                        </div>

                    ) : step === "error" ? (
                        /* ── ERROR STATE ──────────────────────────────── */
                        <div className="text-center py-8">
                            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                            <button onClick={() => setStep("idle")} className="text-amber-400 underline text-sm">
                                Try again
                            </button>
                        </div>
                    ) : (
                        /* ── MAIN FORM ────────────────────────────────── */
                        <>
                            {/* Headline */}
                            <h2 className="text-[32px] font-black text-white leading-[1.1] tracking-tight mb-5">
                                Never Miss a<br />
                                <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">Cheap Flight</span><br />
                                Again.
                            </h2>

                            {/* Ticker */}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 mb-6 transition-all animate-in slide-in-from-left-4">
                                <Radio size={12} className="text-red-500 flex-shrink-0" />
                                <div className="text-xs truncate">
                                    <span className="text-white font-bold">{currentDeal.origin} → {currentDeal.destination}</span>{" "}
                                    <span className="text-emerald-400 font-bold">from ${currentDeal.price}</span>
                                    <span className="text-white/30 ml-2">({formatTHB(currentDeal.price)})</span>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-4 mb-7 font-medium">
                                {BENEFITS.map((b, i) => (
                                    <div key={i} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <b.icon size={16} className="text-amber-400" />
                                        </div>
                                        <span className="text-[13px] text-white/70 leading-snug">{b.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-3 mb-7">
                                <div className="flex -space-x-2">
                                    {AVATARS.map((a, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-[#180840] border-2 border-[#0c051e] flex items-center justify-center text-[10px] font-bold text-amber-300">
                                            {a}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-white/40 font-medium">
                                    <span className="text-amber-400">+{signupCount}</span> joined in the last hour
                                </p>
                            </div>

                            {/* Form */}
                            {step === "loading" ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                                    <p className="text-white/40 text-xs text-center">Saving your alert...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        className="w-full h-14 bg-white hover:bg-gray-100 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <div className="flex items-center gap-3 py-1">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">or</span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>

                                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                                                placeholder="your@email.com"
                                                className={`w-full h-12 bg-white/5 border rounded-xl pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400/30 transition-all ${emailErr ? "border-red-500" : "border-white/10"}`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 active:scale-95 transition-all outline-none"
                                        >
                                            <ArrowRight size={20} className="font-bold" />
                                        </button>
                                    </form>
                                    {emailErr && <p className="text-[10px] text-red-400 px-1 font-bold">{emailErr}</p>}
                                </div>
                            )}

                            <p className="mt-5 text-[10px] text-center text-white/20 leading-relaxed font-medium">
                                By continuing you agree to our <a href="/terms" className="text-white/40 underline">Terms</a> & <a href="/privacy" className="text-white/40 underline">Privacy</a>.<br />
                                No spam. Cancel anytime.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
