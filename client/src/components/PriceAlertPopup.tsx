"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";
import {
    detectRouteFromContext,
    clearSearchContext,
    type DetectedRoute,
} from "@/lib/detectRouteFromContext";

import MainForm from "./PriceAlert/MainForm";
import SuccessState from "./PriceAlert/SuccessState";
import ErrorState from "./PriceAlert/ErrorState";
import LoadingState from "./PriceAlert/LoadingState";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";
const LS_POPUP_SHOWN_KEY = "gt_price_alert_popup_shown";
const LS_POPUP_DISMISSED_KEY = "gt_price_alert_popup_dismissed";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

type PopupViewState =
    | "closed"
    | "form"
    | "submitting"
    | "success-auto-saved"
    | "success-email-sent"
    | "error";

type SubmitSource = "google_popup" | "email_popup";

type AlertSubmitResponse = {
    flow: "auto-saved" | "email-sent";
    message?: string;
    savedEmail?: string;
};

type GoogleCredentialResponse = {
    credential?: string;
};

type GoogleWindow = Window & {
    google?: {
        accounts?: {
            id?: {
                initialize: (config: {
                    client_id: string;
                    callback: (response: GoogleCredentialResponse) => void;
                }) => void;
            };
        };
    };
};

// ──────────────────────────────────────────────
// Safe storage helpers
// ──────────────────────────────────────────────
function canUseDOM() {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

function safeGetLS(key: string): string | null {
    if (!canUseDOM()) return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetLS(key: string, value: string) {
    if (!canUseDOM()) return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // no-op
    }
}

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────
function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ──────────────────────────────────────────────
// Google Helpers
// ──────────────────────────────────────────────
let googleScriptPromise: Promise<void> | null = null;
let googleInitialized = false;

function getGoogleIdApi() {
    const w = window as GoogleWindow;
    return w.google?.accounts?.id;
}

function decodeJwt(token: string): { email: string; name: string } | null {
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

function loadGoogleScript(): Promise<void> {
    if (!canUseDOM()) return Promise.reject(new Error("No DOM"));
    if (getGoogleIdApi()) return Promise.resolve();
    if (googleScriptPromise) return googleScriptPromise;

    googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById("google-gsi-script") as HTMLScriptElement | null;

        if (existing) {
            const checkReady = () => {
                if (getGoogleIdApi()) resolve();
                else reject(new Error("Google GSI unavailable"));
            };

            if (existing.dataset.loaded === "true") {
                checkReady();
                return;
            }

            existing.addEventListener(
                "load",
                () => {
                    existing.dataset.loaded = "true";
                    checkReady();
                },
                { once: true }
            );

            existing.addEventListener(
                "error",
                () => {
                    reject(new Error("Failed to load Google script"));
                },
                { once: true }
            );

            return;
        }

        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            script.dataset.loaded = "true";
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(script);
    });

    return googleScriptPromise;
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────
function usePopupPersistence() {
    const [isSubscribed, setIsSubscribed] = useState(() => safeGetLS(LS_SUBSCRIBED_KEY) === "true");
    const [isDismissed, setIsDismissed] = useState(() => safeGetLS(LS_POPUP_DISMISSED_KEY) === "true");
    const [isPopupShown, setIsPopupShown] = useState(() => safeGetLS(LS_POPUP_SHOWN_KEY) === "true");
    const [savedEmail, setSavedEmail] = useState(() => safeGetLS(LS_EMAIL_KEY) || "");

    const markDismissed = useCallback(() => {
        safeSetLS(LS_POPUP_DISMISSED_KEY, "true");
        setIsDismissed(true);
    }, []);

    const markShown = useCallback(() => {
        safeSetLS(LS_POPUP_SHOWN_KEY, "true");
        setIsPopupShown(true);
    }, []);

    const markSubscribed = useCallback((email: string) => {
        safeSetLS(LS_EMAIL_KEY, email);
        safeSetLS(LS_SUBSCRIBED_KEY, "true");
        setSavedEmail(email);
        setIsSubscribed(true);
    }, []);

    return {
        isSubscribed,
        isDismissed,
        isPopupShown,
        savedEmail,
        markDismissed,
        markShown,
        markSubscribed,
    };
}

function usePopupTriggers(onFire: () => void, enabled: boolean) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!enabled || !canUseDOM()) return;

        firedRef.current = false;

        const fireOnce = () => {
            if (firedRef.current) return;
            firedRef.current = true;
            onFire();
        };

        const timer = window.setTimeout(fireOnce, 30000);
        const isDesktop = window.matchMedia("(pointer:fine)").matches;

        const onMouseLeave = (e: MouseEvent) => {
            if (!isDesktop) return;
            if (e.clientY <= 0) fireOnce();
        };

        let lastY = window.scrollY;
        const onScroll = () => {
            if (isDesktop) return;
            const y = window.scrollY;
            if (y < lastY - 100 && y < 300) fireOnce();
            lastY = y;
        };

        document.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("scroll", onScroll);
        };
    }, [enabled, onFire]);
}

function useGooglePopupAuth(onEmail: (email: string) => void) {
    const [googleReady, setGoogleReady] = useState(false);
    const [googleError, setGoogleError] = useState("");
    const onEmailRef = useRef(onEmail);

    useEffect(() => {
        onEmailRef.current = onEmail;
    }, [onEmail]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            setGoogleReady(false);
            return;
        }

        let cancelled = false;

        loadGoogleScript()
            .then(() => {
                if (cancelled) return;

                const googleId = getGoogleIdApi();
                if (!googleId) throw new Error("Google GSI unavailable");

                if (!googleInitialized) {
                    googleId.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: (response: GoogleCredentialResponse) => {
                            const decoded = response?.credential ? decodeJwt(response.credential) : null;

                            if (!decoded?.email) {
                                setGoogleError("Google sign-in failed. Please use email instead.");
                                return;
                            }

                            setGoogleError("");
                            onEmailRef.current(decoded.email);
                        },
                    });

                    googleInitialized = true;
                }

                setGoogleReady(true);
                setGoogleError("");
            })
            .catch(() => {
                if (cancelled) return;
                setGoogleReady(false);
                setGoogleError("Google sign-in is temporarily unavailable.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { googleReady, googleError };
}

// ──────────────────────────────────────────────
// API Logic
// ──────────────────────────────────────────────
async function submitPriceAlert(params: {
    email: string;
    source: SubmitSource;
    route: DetectedRoute | null;
}): Promise<AlertSubmitResponse> {
    const { email, source, route } = params;

    const body = {
        email,
        source,
        origin: route?.origin || undefined,
        destination: route?.destination || undefined,
        departDate: route?.date || undefined,
        currency: "USD",
    };

    const res = await fetch("/api/alerts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    let data: AlertSubmitResponse | null = null;

    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        throw new Error(data?.message || `Request failed with ${res.status}`);
    }

    if (!data || (data.flow !== "auto-saved" && data.flow !== "email-sent")) {
        throw new Error("Invalid server response");
    }

    return data;
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function PriceAlertPopup() {
    const { deals } = useFlightData();

    const [isOpen, setIsOpen] = useState(false);
    const [isMountedAnim, setIsMountedAnim] = useState(false);
    const [viewState, setViewState] = useState<PopupViewState>("closed");
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [dealIdx, setDealIdx] = useState(0);
    const [signupCount] = useState(() => Math.floor(Math.random() * 30) + 15);
    const [detectedRoute, setDetectedRoute] = useState<DetectedRoute | null>(null);
    const [toastMessage, setToastMessage] = useState("");

    const closeTimerRef = useRef<number | null>(null);
    const openAnimTimerRef = useRef<number | null>(null);

    const {
        isSubscribed,
        isDismissed,
        isPopupShown,
        savedEmail,
        markDismissed,
        markShown,
        markSubscribed,
    } = usePopupPersistence();

    const shouldAllowPopup = !isSubscribed && !isDismissed && !isPopupShown;

    const openPopup = useCallback(() => {
        if (!shouldAllowPopup) return;

        setIsOpen(true);
        setViewState("form");
        setEmailErr("");
        setToastMessage("");
        setDetectedRoute(null);
        markShown();

        if (openAnimTimerRef.current) {
            window.clearTimeout(openAnimTimerRef.current);
        }

        openAnimTimerRef.current = window.setTimeout(() => {
            setIsMountedAnim(true);
        }, 10);
    }, [markShown, shouldAllowPopup]);

    usePopupTriggers(openPopup, shouldAllowPopup);

    useEffect(() => {
        if (savedEmail && !email) {
            setEmail(savedEmail);
        }
    }, [savedEmail, email]);

    useEffect(() => {
        if (!isOpen || !deals?.length) return;

        const id = window.setInterval(() => {
            setDealIdx((i) => (i + 1) % deals.length);
        }, 3000);

        return () => window.clearInterval(id);
    }, [isOpen, deals]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
            if (openAnimTimerRef.current) window.clearTimeout(openAnimTimerRef.current);
        };
    }, []);

    const currentDeal = useMemo(() => {
        return deals?.[dealIdx] || { origin: "RGN", destination: "BKK", price: 38 };
    }, [deals, dealIdx]);

    const scheduleClose = useCallback(
        (dismiss = false) => {
            setIsMountedAnim(false);

            if (dismiss) {
                markDismissed();
            }

            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
            }

            closeTimerRef.current = window.setTimeout(() => {
                setIsOpen(false);
                setViewState("closed");
            }, 400);
        },
        [markDismissed]
    );

    const handleDetectedSubmit = useCallback(
        async (userEmail: string, source: SubmitSource) => {
            const normalizedEmail = userEmail.trim();

            if (!isValidEmail(normalizedEmail)) {
                setEmailErr("Please enter a valid email");
                setViewState("form");
                return;
            }

            setEmail(normalizedEmail);
            setEmailErr("");
            setToastMessage("");
            setDetectedRoute(null);
            setViewState("submitting");

            const route = detectRouteFromContext();
            setDetectedRoute(route);

            try {
                const data = await submitPriceAlert({
                    email: normalizedEmail,
                    source,
                    route,
                });

                markSubscribed(normalizedEmail);

                if (data.flow === "auto-saved") {
                    setToastMessage(
                        data.message || (route ? `✓ Alert set for ${route.label}` : "✓ Alert created.")
                    );
                    setViewState("success-auto-saved");

                    if (route) {
                        clearSearchContext();
                    }
                } else {
                    setToastMessage(data.message || "✓ You're in! We'll email you top deals soon.");
                    setViewState("success-email-sent");
                }
            } catch (error) {
                setToastMessage(
                    error instanceof Error ? error.message : "Something went wrong. Please try again."
                );
                setViewState("error");
            }
        },
        [markSubscribed]
    );

    const handleGoogleEmail = useCallback(
        (googleEmail: string) => {
            void handleDetectedSubmit(googleEmail, "google_popup");
        },
        [handleDetectedSubmit]
    );

    const { googleReady, googleError } = useGooglePopupAuth(handleGoogleEmail);

    const handleEmailSubmit = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            void handleDetectedSubmit(email, "email_popup");
        },
        [email, handleDetectedSubmit]
    );

    const retry = useCallback(() => {
        setToastMessage("");
        setEmailErr("");
        setDetectedRoute(null);
        setViewState("form");
    }, []);

    if (!isOpen || viewState === "closed") return null;

    return (
        <>
            <style>{`
        .gt-font { font-family:'DM Sans',sans-serif; }
        .gt-head { font-family:'Syne',sans-serif; }
        @keyframes gt-up { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes gt-fade { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
        @keyframes gt-ticker { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes gt-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes gt-spin { to{transform:rotate(360deg)} }
        .gt-close:hover { background:rgba(255,255,255,.15)!important; color:#fff!important; }
      `}</style>

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Get flight deal alerts"
                className="gt-font fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
                style={{
                    background: "rgba(6,2,16,.74)",
                    backdropFilter: "blur(7px)",
                    WebkitBackdropFilter: "blur(7px)",
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        scheduleClose(true);
                    }
                }}
            >
                <div
                    className="relative w-full sm:w-[362px] rounded-t-[28px] sm:rounded-3xl overflow-hidden"
                    style={{
                        background: "linear-gradient(155deg,#180840 0%,#0c051e 55%,#180c38 100%)",
                        boxShadow:
                            "0 40px 90px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)",
                        animation: isMountedAnim ? "gt-up .38s cubic-bezier(.34,1.56,.64,1) both" : "none",
                        paddingBottom: "env(safe-area-inset-bottom,0px)",
                    }}
                >
                    <button
                        onClick={() => scheduleClose(true)}
                        aria-label="Close dialog"
                        type="button"
                        className="gt-close absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 transition-all duration-200 z-50 pointer-events-auto"
                        style={{ background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer" }}
                    >
                        <X size={13} strokeWidth={2.5} />
                    </button>

                    <div className="px-6 pt-7 pb-6 relative z-10">
                        <div
                            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                            style={{
                                background: "rgba(251,191,36,.10)",
                                border: "1px solid rgba(251,191,36,.22)",
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                                style={{ animation: "gt-pulse 1.6s infinite" }}
                            />
                            <span className="gt-head text-amber-400 text-[10px] font-bold tracking-widest uppercase">
                                Southeast Asia Deals
                            </span>
                        </div>

                        {viewState === "submitting" ? (
                            <LoadingState />
                        ) : viewState === "error" ? (
                            <ErrorState onRetry={retry} />
                        ) : viewState === "success-auto-saved" || viewState === "success-email-sent" ? (
                            <SuccessState
                                step={viewState === "success-auto-saved" ? "auto-saved" : "email-sent"}
                                email={email}
                                toastMessage={toastMessage}
                                detectedRoute={detectedRoute}
                                onClose={() => scheduleClose(false)}
                            />
                        ) : (
                            <MainForm
                                currentDeal={currentDeal}
                                signupCount={signupCount}
                                googleReady={googleReady}
                                googleError={googleError}
                                googleClientId={GOOGLE_CLIENT_ID}
                                handleEmailSubmit={handleEmailSubmit}
                                email={email}
                                setEmail={setEmail}
                                setEmailErr={setEmailErr}
                                emailErr={emailErr}
                            />
                        )}
                    </div>

                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 pointer-events-none"
                        style={{
                            background: "rgba(251,191,36,.09)",
                            filter: "blur(26px)",
                            borderRadius: "50%",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
