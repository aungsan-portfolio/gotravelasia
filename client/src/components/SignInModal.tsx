/**
 * @file SignInModal.tsx
 * @description Price Alerts modal — email + Google sign-in + route watchlist subscription.
 * Uses /api/price-alerts/subscribe (DB-backed) as the single source of truth.
 * Auto-opens on first visit if `autoOpen` prop is true.
 * Premium Dark Theme Edition.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, ArrowRight, Zap, Target, BadgeDollarSign } from "lucide-react";
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
];

/** Map routeId → IATA codes for the API */
const ROUTE_MAP: Record<string, { origin: string; destination: string }> = {
    "rgn-bkk": { origin: "RGN", destination: "BKK" },
    "rgn-sin": { origin: "RGN", destination: "SIN" },
    "rgn-cnx": { origin: "RGN", destination: "CNX" },
    "mdl-bkk": { origin: "MDL", destination: "BKK" },
    "other": { origin: "", destination: "" },
};

const BENEFITS = [
    { icon: Zap, label: "Real-time alerts before prices spike" },
    { icon: Target, label: "SEA routes tailored to your searches" },
    { icon: BadgeDollarSign, label: "Members save avg. $54 per booking" },
];

const AVATARS = ["KH", "MW", "AS", "NT", "PL"];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ──────────────────────────────────────────────
// Google Identity Services helper
// ──────────────────────────────────────────────
function loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById("google-gsi-script")) {
            resolve();
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
}

/** Decode JWT credential from Google to extract email + name */
function decodeGoogleJwt(token: string): { email: string; name: string } | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        return {
            email: payload.email || "",
            name: payload.name || "",
        };
    } catch {
        return null;
    }
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface SignInModalProps {
    trigger?: React.ReactNode;
    className?: string;
    variant?: "header" | "mobile";
    /** If true, auto-opens the modal on first visit (gated by localStorage) */
    autoOpen?: boolean;
}

export default function SignInModal({
    trigger,
    className,
    variant = "header",
    autoOpen = false,
}: SignInModalProps) {
    const { deals } = useFlightData();

    const [isOpen, setIsOpen] = useState(false);
    // Step 2 (email-only form) is now merged into Step 1 for the premium UI.
    const [step, setStep] = useState<1 | 3 | 4>(1);
    const [email, setEmail] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [dealIdx, setDealIdx] = useState(0);

    const googleBtnRef = useRef<HTMLDivElement>(null);
    const hasAutoOpened = useRef(false);

    // ── Check localStorage on mount ──
    useEffect(() => {
        const stored = localStorage.getItem(LS_SUBSCRIBED_KEY);
        const storedEmail = localStorage.getItem(LS_EMAIL_KEY);
        if (stored === "true" && storedEmail) {
            setIsSubscribed(true);
            setSavedEmail(storedEmail);
        }
    }, []);

    // ── Auto-open on first visit ──
    useEffect(() => {
        if (!autoOpen) return;
        if (hasAutoOpened.current) return;

        const alreadyShown = localStorage.getItem(LS_MODAL_SHOWN_KEY);
        const alreadySubscribed = localStorage.getItem(LS_SUBSCRIBED_KEY);

        if (alreadyShown === "true" || alreadySubscribed === "true") return;

        // Small delay so the page has time to render first
        const timer = setTimeout(() => {
            setIsOpen(true);
            hasAutoOpened.current = true;
        }, 1500);

        return () => clearTimeout(timer);
    }, [autoOpen]);

    // ── Mark modal as shown when it closes ──
    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            localStorage.setItem(LS_MODAL_SHOWN_KEY, "true");
        }
    }, []);

    // ── Reset on open ──
    useEffect(() => {
        if (isOpen) {
            setStep(isSubscribed ? 4 : 1);
            setEmail("");
            setSelectedRoute("");
        }
    }, [isOpen, isSubscribed]);

    // ── Rotate deals every 3s ──
    useEffect(() => {
        if (!isOpen || !deals || deals.length === 0) return;
        const id = setInterval(() => setDealIdx((i) => (i + 1) % deals.length), 3000);
        return () => clearInterval(id);
    }, [isOpen, deals]);

    const currentDeal = deals?.[dealIdx] || { origin: "RGN", destination: "BKK", price: 38 };

    // ── Google Sign-In handler ──
    const handleGoogleSignIn = useCallback(async () => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("[SignInModal] VITE_GOOGLE_CLIENT_ID not configured");
            return;
        }

        setGoogleLoading(true);
        try {
            await loadGoogleScript();

            // Use the One Tap / popup flow
            const google = (window as any).google;
            if (!google?.accounts?.id) {
                setGoogleLoading(false);
                return;
            }

            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response: { credential: string }) => {
                    const decoded = decodeGoogleJwt(response.credential);
                    if (decoded?.email) {
                        // Save email and skip to route selection
                        localStorage.setItem(LS_EMAIL_KEY, decoded.email);
                        setSavedEmail(decoded.email);
                        setEmail(decoded.email);
                        setStep(3);
                    }
                    setGoogleLoading(false);
                },
                auto_select: false,
            });

            google.accounts.id.prompt((notification: any) => {
                // If One Tap is dismissed or not available, try popup
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Render the button in a hidden div and click it
                    if (googleBtnRef.current) {
                        google.accounts.id.renderButton(googleBtnRef.current, {
                            type: "standard",
                            theme: "outline",
                            size: "large",
                            width: "100%",
                        });
                        // Click the rendered button
                        const btn = googleBtnRef.current.querySelector("div[role='button']") as HTMLElement;
                        if (btn) btn.click();
                        else setGoogleLoading(false);
                    } else {
                        setGoogleLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error("[SignInModal] Google Sign-In failed", error);
            setGoogleLoading(false);
        }
    }, []);

    // ── Email Submission (Goes straight to Step 3) ──
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        localStorage.setItem(LS_EMAIL_KEY, email);
        setSavedEmail(email);
        setStep(3);
    };

    // ── Route Selection → API Call ──
    const handleRouteSelect = async (routeId: string) => {
        setSelectedRoute(routeId);
        setIsSubmitting(true);

        const routeCodes = ROUTE_MAP[routeId] || { origin: "", destination: "" };

        try {
            const res = await fetch("/api/price-alerts/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email || savedEmail,
                    routeId,
                    origin: routeCodes.origin,
                    destination: routeCodes.destination,
                    source: "modal",
                }),
            });

            await res.json().catch(() => ({}));

            if (res.ok) {
                localStorage.setItem(LS_SUBSCRIBED_KEY, "true");
                setIsSubscribed(true);
                setStep(4);
                setTimeout(() => setIsOpen(false), 2500);
            }
        } catch {
            // Silently fail — still mark as subscribed for UX
            localStorage.setItem(LS_SUBSCRIBED_KEY, "true");
            setIsSubscribed(true);
            setStep(4);
            setTimeout(() => setIsOpen(false), 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Trigger button ──
    const defaultTrigger =
        variant === "mobile" ? (
            <Button
                variant="outline"
                className={`w-full justify-start text-sm ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "Price Alerts"}
            </Button>
        ) : (
            <Button
                variant="outline"
                className={`hidden sm:inline-flex text-sm font-medium ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "Price Alerts"}
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
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
                aria-describedby={undefined}
            >
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
                    .gt-head   { font-family:'Syne',sans-serif; }
                    @keyframes gt-fade   { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
                    @keyframes gt-ticker { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
                    @keyframes gt-pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
                `}</style>

                {/* Fixed Close Button */}
                <button
                    onClick={() => handleOpenChange(false)}
                    className="absolute top-4 right-4 z-[60] w-7 h-7 rounded-full flex items-center justify-center text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-all pointer-events-auto"
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="relative px-6 py-7 max-h-[85vh] overflow-y-auto overscroll-contain">
                    {/* ═══════════ STEP 1: INTRO (Premium UI) ═══════════ */}
                    {step === 1 && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <h2 className="gt-head text-[28px] font-extrabold text-white leading-tight mb-4"
                                style={{ letterSpacing: "-0.025em" }}>
                                Never Miss a<br />
                                <span className="text-amber-400" style={{ textShadow: "0 0 26px rgba(251,191,36,.35)" }}>
                                    Cheap Flight
                                </span>{" "}Again.
                            </h2>

                            {/* Live ticker */}
                            <div
                                key={`${currentDeal.origin}-${currentDeal.destination}`}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                                style={{
                                    background: "rgba(255,255,255,.05)",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    animation: "gt-ticker .32s ease",
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" style={{ animation: "gt-pulse 1.6s infinite" }} />
                                <span className="text-xs text-white/60 leading-none">
                                    <span className="font-semibold text-white/88">
                                        {currentDeal.origin} → {currentDeal.destination}
                                    </span>{" "}from{" "}
                                    <span className="text-emerald-400 font-bold">${currentDeal.price}</span>
                                    <span className="text-amber-400"> · saved $47</span>
                                    <span className="text-white/28"> · 2h ago</span>
                                </span>
                            </div>

                            {/* Benefits list */}
                            <div className="flex flex-col gap-2.5 mb-5 mt-2">
                                {BENEFITS.map(({ icon: Icon, label }, i) => (
                                    <div key={i} className="flex items-center gap-3" style={{ animation: `gt-fade .4s ease ${i * 0.07}s both` }}>
                                        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                                            style={{ background: "rgba(255,255,255,.06)" }}>
                                            <Icon size={15} className="text-amber-400" strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] text-white/70 leading-snug">{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-2.5 mb-5 mt-4">
                                <div className="flex">
                                    {AVATARS.map((init, i) => (
                                        <div key={i} className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold text-amber-300"
                                            style={{ marginLeft: i === 0 ? 0 : -8, background: "rgba(251,191,36,.14)", border: "2px solid #0c051e" }}>
                                            {init}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[12px] text-white/42">
                                    <span className="font-semibold text-amber-400">10,000+</span> joined already
                                </span>
                            </div>

                            <div className="h-px mb-5" style={{ background: "rgba(255,255,255,.07)" }} />

                            {/* Google Sign In */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={googleLoading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-[#1a0a3e] transition-all duration-200 mb-3"
                                style={{ background: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,.28)", fontFamily: "'DM Sans',sans-serif" }}
                            >
                                {googleLoading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 13.875 17.64 11.567 17.64 9.2z" />
                                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                                        <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>
                            <div ref={googleBtnRef} className="hidden" />

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                                <span className="text-white/28 text-xs">or</span>
                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                            </div>

                            {/* Email Submit Form */}
                            <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-2 mt-1">
                                <div className="relative flex-1">
                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none" strokeWidth={2} />
                                    <input
                                        type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                        required className="w-full pl-9 pr-3 py-3 rounded-xl text-[13px] text-white outline-none placeholder:text-white/22 transition-colors"
                                        style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.10)", fontFamily: "'DM Sans',sans-serif" }}
                                    />
                                </div>
                                <button type="submit" className="w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95"
                                    style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(251,191,36,.28)" }}>
                                    <ArrowRight size={17} className="text-[#1a0a3e]" strokeWidth={2.5} />
                                </button>
                            </form>

                            <p className="text-white/20 text-[11px] text-center leading-relaxed mt-4">
                                By continuing you accept our <a href="/terms" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">Terms</a> and <a href="/privacy" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">Privacy</a>.
                            </p>
                        </div>
                    )}

                    {/* ═══════════ STEP 3: ROUTE SELECTION ═══════════ */}
                    {step === 3 && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 py-3">
                            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">Which route?</h2>
                            <p className="text-white/50 text-[13px] mb-5">
                                Pick a route and we'll save it for <span className="text-amber-400">{email || savedEmail}</span>.
                            </p>

                            <div className="grid grid-cols-1 gap-2.5 mb-2">
                                {WATCH_ROUTES.map((route) => (
                                    <button key={route.id} onClick={() => handleRouteSelect(route.id)} disabled={isSubmitting}
                                        className={`w-full min-h-[46px] text-left px-4 tracking-wide rounded-xl border transition-all text-[13px] font-semibold ${selectedRoute === route.id
                                            ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                                            : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5"
                                            } disabled:opacity-50`}
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    >
                                        {isSubmitting && selectedRoute === route.id ? (
                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                                        ) : route.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ═══════════ STEP 4: DONE ═══════════ */}
                    {step === 4 && (
                        <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", boxShadow: "0 8px 28px rgba(74,222,128,.28)" }}>
                                <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
                            </div>
                            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">You're in!</h2>
                            <p className="text-white/50 text-[13.5px] leading-relaxed mb-6">
                                We've saved your route. You'll receive<br />deal updates at <span className="text-amber-400">{savedEmail}</span>
                            </p>
                            <button onClick={() => handleOpenChange(false)} className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 font-semibold h-11 rounded-xl transition-all active:scale-[0.98] text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Got it, thanks!
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
