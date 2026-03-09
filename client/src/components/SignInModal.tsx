/**
 * @file SignInModal.tsx
 * @description Price Alerts modal — production-safe refactor
 * Single source of truth: /api/price-alerts/subscribe
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Loader2,
    Mail,
    ArrowRight,
    Zap,
    Target,
    BadgeDollarSign,
    AlertCircle,
} from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";
const LS_MODAL_SHOWN_KEY = "gt_modal_shown";

const WATCH_ROUTES = [
    { id: "rgn-bkk", label: "Yangon → Bangkok" },
    { id: "rgn-sin", label: "Yangon → Singapore" },
    { id: "rgn-cnx", label: "Yangon → Chiang Mai" },
    { id: "mdl-bkk", label: "Mandalay → Bangkok" },
    { id: "other", label: "Other Destinations" },
] as const;

const ROUTE_MAP: Record<string, { origin: string; destination: string }> = {
    "rgn-bkk": { origin: "RGN", destination: "BKK" },
    "rgn-sin": { origin: "RGN", destination: "SIN" },
    "rgn-cnx": { origin: "RGN", destination: "CNX" },
    "mdl-bkk": { origin: "MDL", destination: "BKK" },
    other: { origin: "", destination: "" },
};

const BENEFITS = [
    { icon: Zap, label: "Real-time alerts before prices spike" },
    { icon: Target, label: "SEA routes tailored to your searches" },
    { icon: BadgeDollarSign, label: "Members save avg. $54 per booking" },
];

const AVATARS = ["KH", "MW", "AS", "NT", "PL"];
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/** Step 1 = Email/Google sign-in, Step 3 = Route selection, Step 4 = Success confirmation.
 *  Step 2 was intentionally removed (was a standalone email form, now merged into Step 1). */
type Step = 1 | 3 | 4;

interface SignInModalProps {
    trigger?: React.ReactNode;
    className?: string;
    variant?: "header" | "mobile";
    autoOpen?: boolean;
}

// Note: window.google is declared globally in Map.tsx via @types/google.maps

// ──────────────────────────────────────────────
// Safe browser storage helpers
// ──────────────────────────────────────────────
function canUseDOM() {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

function getLS(key: string): string | null {
    if (!canUseDOM()) return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function setLS(key: string, value: string) {
    if (!canUseDOM()) return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // ignore storage errors
    }
}

// ──────────────────────────────────────────────
// Google helpers
// ──────────────────────────────────────────────
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
    if (!canUseDOM()) return Promise.reject(new Error("No DOM available"));
    if ((window as any).google?.accounts?.id) return Promise.resolve();
    if (googleScriptPromise) return googleScriptPromise;

    googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById("google-gsi-script") as HTMLScriptElement | null;

        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Failed to load Google script")), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(script);
    });

    return googleScriptPromise;
}

function decodeGoogleJwt(token: string): { email: string; name: string } | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

        const payload = JSON.parse(atob(base64));
        return {
            email: typeof payload.email === "string" ? payload.email : "",
            name: typeof payload.name === "string" ? payload.name : "",
        };
    } catch {
        return null;
    }
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function SignInModal({
    trigger,
    className,
    variant = "header",
    autoOpen = false,
}: SignInModalProps) {
    const { deals } = useFlightData();

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>(1);
    const [userEmail, setUserEmail] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [googleError, setGoogleError] = useState("");
    const [googleReady, setGoogleReady] = useState(false);
    const [dealIdx, setDealIdx] = useState(0);

    const googleBtnRef = useRef<HTMLDivElement>(null);
    const hasAutoOpened = useRef(false);
    const googleInitialized = useRef(false);
    // FIX ②: Ref guard to prevent rapid double-click on route selection
    const submittingRef = useRef(false);

    // ── Initial hydrate from localStorage ──
    useEffect(() => {
        const storedSubscribed = getLS(LS_SUBSCRIBED_KEY) === "true";
        const storedEmail = getLS(LS_EMAIL_KEY) || "";

        setIsSubscribed(storedSubscribed);
        if (storedEmail) setUserEmail(storedEmail);
    }, []);

    // ── Preload Google script ──
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        loadGoogleScript()
            .then(() => setGoogleReady(true))
            .catch(() => setGoogleError("Google sign-in is temporarily unavailable."));
    }, []);

    // ── Auto-open on first visit ──
    useEffect(() => {
        if (!autoOpen || hasAutoOpened.current) return;

        const alreadyShown = getLS(LS_MODAL_SHOWN_KEY) === "true";
        const alreadySubscribed = getLS(LS_SUBSCRIBED_KEY) === "true";

        if (alreadyShown || alreadySubscribed) return;

        const timer = window.setTimeout(() => {
            setIsOpen(true);
            setLS(LS_MODAL_SHOWN_KEY, "true");
            hasAutoOpened.current = true;
        }, 1500);

        return () => window.clearTimeout(timer);
    }, [autoOpen]);

    // ── Reset UI on open ──
    // Note: googleError is intentionally preserved across modal reopens
    //       so users see a persistent notice if Google is unavailable.
    useEffect(() => {
        if (!isOpen) return;

        setSubmitError("");
        setSelectedRoute("");
        setStep(isSubscribed ? 4 : 1);
    }, [isOpen, isSubscribed]);

    // ── Rotate deals every 3s ──
    useEffect(() => {
        if (!isOpen || !deals?.length) return;

        const id = window.setInterval(() => {
            setDealIdx((i) => (i + 1) % deals.length);
        }, 3000);

        return () => window.clearInterval(id);
    }, [isOpen, deals]);

    // FIX ①: Auto-close after success with proper cleanup
    useEffect(() => {
        if (step !== 4 || !isOpen) return;

        const timer = window.setTimeout(() => {
            setIsOpen(false);
        }, 2500);

        return () => window.clearTimeout(timer);
    }, [step, isOpen]);

    const currentDeal = useMemo(() => {
        return deals?.[dealIdx] || { origin: "RGN", destination: "BKK", price: 38 };
    }, [deals, dealIdx]);

    // ── Open/close handler ──
    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setLS(LS_MODAL_SHOWN_KEY, "true");
            setSubmitError("");
            setSelectedRoute("");
        }
    }, []);

    // ── Google initialize once per page ──
    const initializeGoogle = useCallback(() => {
        if (!GOOGLE_CLIENT_ID || !(window as any).google?.accounts?.id || googleInitialized.current) return;

        (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential?: string }) => {
                const decoded = response?.credential ? decodeGoogleJwt(response.credential) : null;

                if (!decoded?.email) {
                    setGoogleError("Google sign-in failed. Please use email instead.");
                    return;
                }

                setUserEmail(decoded.email);
                setLS(LS_EMAIL_KEY, decoded.email);
                setSubmitError("");
                setGoogleError("");
                setStep(3);
            },
        });

        googleInitialized.current = true;
    }, []);

    // ── Render Google button when modal is open on step 1 ──
    useEffect(() => {
        if (!isOpen || step !== 1 || !googleReady || !GOOGLE_CLIENT_ID) return;
        if (!(window as any).google?.accounts?.id || !googleBtnRef.current) return;

        initializeGoogle();

        googleBtnRef.current.innerHTML = "";

        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 314,
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
        });
    }, [isOpen, step, googleReady, initializeGoogle]);

    // ── Email submit ──
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = userEmail.trim();

        if (!isValidEmail(trimmed)) {
            setSubmitError("Please enter a valid email address.");
            return;
        }

        setUserEmail(trimmed);
        setLS(LS_EMAIL_KEY, trimmed);
        setSubmitError("");
        setStep(3);
    };

    // ── Route submit to API ──
    const handleRouteSelect = async (routeId: string) => {
        // FIX ②: Ref guard — prevents duplicate API calls on fast double-click
        if (submittingRef.current) return;

        const email = userEmail.trim();

        if (!isValidEmail(email)) {
            setSubmitError("Please enter a valid email before choosing a route.");
            setStep(1);
            return;
        }

        setSelectedRoute(routeId);
        setIsSubmitting(true);
        submittingRef.current = true;
        setSubmitError("");

        const routeCodes = ROUTE_MAP[routeId] || { origin: "", destination: "" };

        try {
            const res = await fetch("/api/price-alerts/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    routeId,
                    origin: routeCodes.origin,
                    destination: routeCodes.destination,
                    source: "modal",
                }),
            });

            // FIX ④: Typed payload instead of `any`
            let payload: { message?: string; error?: string } | null = null;
            try {
                payload = await res.json();
            } catch {
                payload = null;
            }

            if (!res.ok) {
                const message =
                    payload?.message ||
                    payload?.error ||
                    "Could not save your alert. Please try again.";
                throw new Error(message);
            }

            setLS(LS_SUBSCRIBED_KEY, "true");
            setLS(LS_EMAIL_KEY, email);
            setIsSubscribed(true);
            setStep(4);
            // FIX ①: Auto-close is now handled by the useEffect above with proper cleanup
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Network error. Please try again."
            );
        } finally {
            setIsSubmitting(false);
            submittingRef.current = false;
        }
    };

    const triggerLabel = isSubscribed
        ? `✅ ${userEmail.split("@")[0] || "Subscribed"}`
        : "Price Alerts";

    const defaultTrigger = (
        <Button
            variant="outline"
            className={
                variant === "mobile"
                    ? `w-full justify-start text-sm ${className || ""}`
                    : `hidden sm:inline-flex text-sm font-medium ${className || ""}`
            }
        >
            {triggerLabel}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

            <DialogContent
                className="sm:max-w-[360px] w-[95vw] p-0 border-none rounded-[20px] [&>button]:hidden outline-none"
                style={{
                    background: "linear-gradient(155deg,#180840 0%,#0c051e 55%,#180c38 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                aria-describedby={undefined}
            >
                {/* FIX ⑦: Ideally move this @import to index.html <head> as a <link> tag
            for better performance. Kept here for now as modal-scoped fonts. */}
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
          .gt-head { font-family:'Syne',sans-serif; }
          @keyframes gt-fade { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
          @keyframes gt-ticker { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
          @keyframes gt-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        `}</style>

                <button
                    onClick={() => handleOpenChange(false)}
                    className="absolute top-4 right-4 z-[60] w-7 h-7 rounded-full flex items-center justify-center text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-all pointer-events-auto"
                    aria-label="Close"
                    type="button"
                >
                    ✕
                </button>

                <div className="relative px-6 py-7 max-h-[85vh] overflow-y-auto overscroll-contain">
                    {step === 1 && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <h2
                                className="gt-head text-[28px] font-extrabold text-white leading-tight mb-4"
                                style={{ letterSpacing: "-0.025em" }}
                            >
                                Never Miss a
                                <br />
                                <span
                                    className="text-amber-400"
                                    style={{ textShadow: "0 0 26px rgba(251,191,36,.35)" }}
                                >
                                    Cheap Flight
                                </span>{" "}
                                Again.
                            </h2>

                            <div
                                key={`${currentDeal.origin}-${currentDeal.destination}-${dealIdx}`}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                                style={{
                                    background: "rgba(255,255,255,.05)",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    animation: "gt-ticker .32s ease",
                                }}
                            >
                                <div
                                    className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"
                                    style={{ animation: "gt-pulse 1.6s infinite" }}
                                />
                                <span className="text-xs text-white/60 leading-none">
                                    <span className="font-semibold text-white/88">
                                        {currentDeal.origin} → {currentDeal.destination}
                                    </span>{" "}
                                    from{" "}
                                    <span className="text-emerald-400 font-bold">${currentDeal.price}</span>
                                    <span className="text-amber-400"> · saved $47</span>
                                    <span className="text-white/28"> · 2h ago</span>
                                </span>
                            </div>

                            <div className="flex flex-col gap-2.5 mb-5 mt-2">
                                {BENEFITS.map(({ icon: Icon, label }, i) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3"
                                        style={{ animation: `gt-fade .4s ease ${i * 0.07}s both` }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                                            style={{ background: "rgba(255,255,255,.06)" }}
                                        >
                                            <Icon size={15} className="text-amber-400" strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] text-white/70 leading-snug">{label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2.5 mb-5 mt-4">
                                <div className="flex">
                                    {AVATARS.map((init, i) => (
                                        <div
                                            key={`${init}-${i}`}
                                            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold text-amber-300"
                                            style={{
                                                marginLeft: i === 0 ? 0 : -8,
                                                background: "rgba(251,191,36,.14)",
                                                border: "2px solid #0c051e",
                                            }}
                                        >
                                            {init}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[12px] text-white/42">
                                    <span className="font-semibold text-amber-400">10,000+</span> joined already
                                </span>
                            </div>

                            <div className="h-px mb-5" style={{ background: "rgba(255,255,255,.07)" }} />

                            {GOOGLE_CLIENT_ID ? (
                                <div
                                    className="w-full flex justify-center mb-3"
                                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,.28))" }}
                                >
                                    <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
                                </div>
                            ) : null}

                            {googleError ? (
                                <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-200 text-[12px] px-3 py-2 mb-3">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>{googleError}</span>
                                </div>
                            ) : null}

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                                <span className="text-white/28 text-xs">or</span>
                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                            </div>

                            <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-2 mt-1">
                                <div className="relative flex-1">
                                    <Mail
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
                                        strokeWidth={2}
                                    />
                                    {/* FIX ⑥: Added aria-label for screen reader accessibility */}
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        aria-label="Email address"
                                        className="w-full pl-9 pr-3 py-3 rounded-xl text-[13px] text-white outline-none placeholder:text-white/22 transition-colors"
                                        style={{
                                            background: "rgba(255,255,255,.07)",
                                            border: "1px solid rgba(255,255,255,.10)",
                                            fontFamily: "'DM Sans',sans-serif",
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95"
                                    style={{
                                        background: "linear-gradient(135deg,#fbbf24,#f97316)",
                                        border: "none",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 16px rgba(251,191,36,.28)",
                                    }}
                                >
                                    <ArrowRight size={17} className="text-[#1a0a3e]" strokeWidth={2.5} />
                                </button>
                            </form>

                            {submitError ? (
                                <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 text-[12px] px-3 py-2 mt-3">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            ) : null}

                            <p className="text-white/20 text-[11px] text-center leading-relaxed mt-4">
                                By continuing you accept our{" "}
                                <a href="/terms" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">
                                    Terms
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">
                                    Privacy
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 py-3">
                            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">Which route?</h2>
                            <p className="text-white/50 text-[13px] mb-5">
                                Pick a route and we'll save it for{" "}
                                <span className="text-amber-400">{userEmail}</span>.
                            </p>

                            {submitError ? (
                                <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 text-[12px] px-3 py-2 mb-3">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            ) : null}

                            {/* FIX ⑧: Added role="radiogroup" for screen reader route selection */}
                            <div className="grid grid-cols-1 gap-2.5 mb-2" role="radiogroup" aria-label="Select a flight route">
                                {WATCH_ROUTES.map((route) => (
                                    <button
                                        key={route.id}
                                        onClick={() => handleRouteSelect(route.id)}
                                        disabled={isSubmitting}
                                        type="button"
                                        role="radio"
                                        aria-checked={selectedRoute === route.id}
                                        className={`w-full min-h-[46px] text-left px-4 tracking-wide rounded-xl border transition-all text-[13px] font-semibold ${selectedRoute === route.id
                                            ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                                            : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5"
                                            } disabled:opacity-50`}
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    >
                                        {isSubmitting && selectedRoute === route.id ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            route.label
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
                            <div
                                className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg,#4ade80,#16a34a)",
                                    boxShadow: "0 8px 28px rgba(74,222,128,.28)",
                                }}
                            >
                                <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
                            </div>

                            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">You're in!</h2>
                            <p className="text-white/50 text-[13.5px] leading-relaxed mb-6">
                                We've saved your route. You'll receive
                                <br />
                                deal updates at <span className="text-amber-400">{userEmail}</span>
                            </p>

                            <button
                                onClick={() => handleOpenChange(false)}
                                type="button"
                                className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 font-semibold h-11 rounded-xl transition-all active:scale-[0.98] text-[13px]"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
