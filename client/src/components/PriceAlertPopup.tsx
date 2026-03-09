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
          relative w-full sm:w-[362px] bg-[#0c051e] rounded-[28px_28px_0_0] sm:rounded-3xl overflow-hidden
          transition-all duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
          shadow-[0_40px_90px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.09)]
          ${mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-[0.97]"}
        `}
                style={{
                    background: "linear-gradient(155deg, #180840 0%, #0c051e 55%, #180c38 100%)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                }}
            >
                {/* Glow Effects */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[60px] pointer-events-none rounded-full bg-amber-400/10 blur-[26px]" />

                {/* Close */}
                <button
                    onClick={close}
                    className="absolute top-[14px] right-[14px] w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all z-10 text-[14px]"
                >
                    ✕
                </button>

                <div className="px-6 pt-7 pb-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 mb-3.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                        <div className="w-[6px] h-[6px] rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-400 tracking-[0.1em] uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>Southeast Asia Deals</span>
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
            </div>
        </div>
    );
}
