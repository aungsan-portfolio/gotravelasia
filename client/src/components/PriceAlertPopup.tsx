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
import { X, Radio } from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";
import { formatTHB } from "@/const";
import {
    detectRouteFromContext,
    clearSearchContext,
    type DetectedRoute,
} from "@/lib/detectRouteFromContext";

import MainForm from "./PriceAlert/MainForm";
import SuccessState from "./PriceAlert/SuccessState";
import ErrorState from "./PriceAlert/ErrorState";
import LoadingState from "./PriceAlert/LoadingState";

// ── Project Constants (Sync with SignInModal) ────────────────────
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";
const LS_MODAL_SHOWN_KEY = "gt_modal_shown";
const LS_POPUP_DISMISSED = "gt_popup_dismissed";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

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

    // ── Preload Google Script ──────────────────────────────────────
    useEffect(() => {
        if (GOOGLE_CLIENT_ID) loadGoogleScript().catch(() => { });
    }, []);

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

        try {
            let google = (window as any).google;
            if (!google) {
                await loadGoogleScript();
                google = (window as any).google;
            }
            if (!google) throw new Error("Google not loaded");

            const client = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile',
                callback: async (response: any) => {
                    if (response.access_token) {
                        setStep("loading");
                        try {
                            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                                headers: { Authorization: `Bearer ${response.access_token}` }
                            });
                            const user = await res.json();
                            if (user.email) {
                                await submitAlert(user.email, "google_popup");
                            } else {
                                setStep("error");
                            }
                        } catch { setStep("error"); }
                    } else {
                        setStep("error");
                    }
                },
            });
            client.requestAccessToken();
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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
                .gt-font   { font-family:'DM Sans',sans-serif; }
                .gt-head   { font-family:'Syne',sans-serif; }
                @keyframes gt-up     { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:none} }
                @keyframes gt-fade   { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
                @keyframes gt-ticker { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
                @keyframes gt-spin   { to{transform:rotate(360deg)} }
                @keyframes gt-pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
                .gt-google:hover { transform:translateY(-1px); }
                .gt-submit:hover { filter:brightness(1.1); transform:scale(1.03); }
                .gt-close:hover  { background:rgba(255,255,255,.15)!important; color:#fff!important; }
            `}</style>

            {/* Overlay — z-[9999] clears StickyCTA (z-50) and any modals */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Get flight deal alerts"
                className="gt-font fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
                style={{ background: "rgba(6,2,16,.74)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)" }}
                onClick={(e) => e.target === e.currentTarget && close()}
            >
                {/* Card */}
                <div
                    className="relative w-full sm:w-[362px] rounded-t-[28px] sm:rounded-3xl overflow-hidden"
                    style={{
                        background: "linear-gradient(155deg,#180840 0%,#0c051e 55%,#180c38 100%)",
                        boxShadow: "0 40px 90px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)",
                        animation: mounted ? "gt-up .38s cubic-bezier(.34,1.56,.64,1) both" : "none",
                        paddingBottom: "env(safe-area-inset-bottom,0px)",
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={close}
                        aria-label="Close dialog"
                        className="gt-close absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 transition-all duration-200 z-50"
                        style={{ background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer" }}
                    >
                        <X size={13} strokeWidth={2.5} />
                    </button>

                    <div className="px-6 pt-7 pb-6 relative z-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                            style={{ background: "rgba(251,191,36,.10)", border: "1px solid rgba(251,191,36,.22)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                                style={{ animation: "gt-pulse 1.6s infinite" }} />
                            <span className="gt-head text-amber-400 text-[10px] font-bold tracking-widest uppercase">
                                Southeast Asia Deals
                            </span>
                        </div>

                        {/* ── SUCCESS STATES ─────────────────────────────── */}
                        {isSuccess ? (
                            <SuccessState
                                step={step as "auto-saved" | "email-sent"}
                                email={email}
                                toastMessage={toastMessage}
                                detectedRoute={detectedRoute}
                                onClose={close}
                            />

                        ) : step === "error" ? (
                            /* ── ERROR STATE ──────────────────────────────── */
                            <ErrorState onRetry={() => setStep("idle")} />

                        ) : step === "loading" ? (
                            /* ── LOADING STATE ────────────────────────────── */
                            <LoadingState />

                        ) : (
                            /* ── MAIN FORM ────────────────────────────────── */
                            <MainForm
                                currentDeal={currentDeal}
                                signupCount={signupCount}
                                handleGoogleSignIn={handleGoogleSignIn}
                                handleEmailSubmit={handleEmailSubmit}
                                email={email}
                                setEmail={setEmail}
                                setEmailErr={setEmailErr}
                                emailErr={emailErr}
                            />
                        )}
                    </div>

                    {/* Ambient bottom glow */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 pointer-events-none"
                        style={{ background: "rgba(251,191,36,.09)", filter: "blur(26px)", borderRadius: "50%" }}
                    />
                </div>
            </div>
        </>
    );
}
