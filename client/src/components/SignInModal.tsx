/**
 * @file SignInModal.tsx
 * @description Price Alerts modal — email + Google sign-in + route watchlist subscription.
 * Uses /api/price-alerts/subscribe (DB-backed) as the single source of truth.
 * Auto-opens on first visit if `autoOpen` prop is true.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Mail, X } from "lucide-react";

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
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1=intro, 2=email, 3=routes, 4=done
    const [email, setEmail] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);

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

    // ── Google Sign-In handler ──
    const handleGoogleSignIn = useCallback(async () => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("[SignInModal] VITE_GOOGLE_CLIENT_ID not configured");
            // Fallback: go to email step
            setStep(2);
            return;
        }

        setGoogleLoading(true);
        try {
            await loadGoogleScript();

            // Use the One Tap / popup flow
            const google = (window as any).google;
            if (!google?.accounts?.id) {
                setStep(2);
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
                    } else {
                        // Fallback to email step
                        setStep(2);
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
            setStep(2);
        }
    }, []);

    // ── Step 2: Save email locally, go to route selection ──
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // Save email locally; API call happens on route selection
        localStorage.setItem(LS_EMAIL_KEY, email);
        setSavedEmail(email);
        setStep(3);
    };

    // ── Step 3: Route selected → single API call ──
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

            const data = await res.json().catch(() => ({}));

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
                className="sm:max-w-[440px] p-0 border-none rounded-[1.5rem] shadow-2xl bg-white [&>button]:hidden max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                aria-describedby={undefined}
            >
                {/* ── Close button ── */}
                <button
                    onClick={() => handleOpenChange(false)}
                    className="absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>

                {/* ═══════════ STEP 4: DONE ═══════════ */}
                {step === 4 && (
                    <div className="px-8 py-12 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">You're All Set! 🎉</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            We've saved your route preference. You'll receive deal updates at:
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1">{savedEmail}</p>
                    </div>
                )}

                {/* ═══════════ STEP 3: ROUTE SELECTION ═══════════ */}
                {step === 3 && (
                    <div className="px-8 pb-10 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
                            <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 size={18} /> Email saved!
                            </p>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Which route interests you?
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Pick a route and we'll save it for you.
                        </p>

                        <div className="grid grid-cols-1 gap-2 mb-6">
                            {WATCH_ROUTES.map((route) => (
                                <button
                                    key={route.id}
                                    onClick={() => handleRouteSelect(route.id)}
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting && selectedRoute === route.id}
                                    aria-disabled={isSubmitting}
                                    className={`w-full min-h-[44px] h-12 text-left px-4 rounded-lg border transition-all text-sm font-medium ${selectedRoute === route.id
                                        ? "border-[#581c87] bg-purple-50 text-[#581c87]"
                                        : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50"
                                        } disabled:opacity-50 disabled:pointer-events-none`}
                                >
                                    {isSubmitting && selectedRoute === route.id ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </span>
                                    ) : (
                                        route.label
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 2: EMAIL INPUT ═══════════ */}
                {step === 2 && (
                    <div className="px-8 pb-10 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            Enter your email
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            We'll save your preferred routes and send deal updates.
                        </p>

                        <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                autoFocus
                                className="h-14 rounded-xl border-gray-200 focus:border-[#581c87] focus:ring-[#581c87] text-lg pl-4 transition-all"
                            />
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white font-bold text-lg shadow-lg shadow-purple-100 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </form>

                        <button
                            onClick={() => setStep(1)}
                            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
                        >
                            ← Back
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                            By adding your email you accept our{" "}
                            <a href="/terms" className="text-[#581c87] hover:underline">
                                Terms of Use
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-[#581c87] hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                )}

                {/* ═══════════ STEP 1: INTRO ═══════════ */}
                {step === 1 && (
                    <div className="px-8 pb-10 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                            Get Deal
                            <br />
                            <span className="text-[#581c87]">Alerts.</span>
                        </h2>

                        <p className="text-gray-500 mt-4 text-[15px] font-medium leading-relaxed">
                            Stay updated on the best Southeast Asia flight deals:
                        </p>

                        <ul className="mt-4 mb-8 space-y-3">
                            {[
                                "Compare prices across multiple airlines",
                                "Get email updates on Southeast Asia travel deals",
                                "Save your favorite routes for quick search",
                            ].map((text, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-sm text-gray-600"
                                >
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 text-[#fbbf24] flex-shrink-0"
                                    />
                                    {text}
                                </li>
                            ))}
                        </ul>

                        {/* ── Google Sign-In Button ── */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="w-full min-h-[44px] h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm disabled:opacity-60"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>

                        {/* Hidden container for Google rendered button */}
                        <div ref={googleBtnRef} className="hidden" />

                        {/* ── Divider ── */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* ── Email Button ── */}
                        <button
                            onClick={() => setStep(2)}
                            className="w-full min-h-[44px] h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-bold text-white transition-colors active:scale-[0.98]"
                            style={{ background: '#581c87' }}
                        >
                            <Mail className="w-5 h-5" />
                            Continue with email
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                            By adding your email you accept our{" "}
                            <a href="/terms" className="text-[#581c87] hover:underline">
                                Terms of Use
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-[#581c87] hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
