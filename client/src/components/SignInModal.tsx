/**
 * @file SignInModal.tsx
 * @description Price Alerts modal — email + route watchlist subscription.
 * Uses /api/price-alerts/subscribe (DB-backed) as the single source of truth.
 */

import { useState, useEffect } from "react";
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

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface SignInModalProps {
    trigger?: React.ReactNode;
    className?: string;
    variant?: "header" | "mobile";
}

export default function SignInModal({
    trigger,
    className,
    variant = "header",
}: SignInModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1=intro, 2=email, 3=routes, 4=done
    const [email, setEmail] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");

    // ── Check localStorage on mount ──
    useEffect(() => {
        const stored = localStorage.getItem(LS_SUBSCRIBED_KEY);
        const storedEmail = localStorage.getItem(LS_EMAIL_KEY);
        if (stored === "true" && storedEmail) {
            setIsSubscribed(true);
            setSavedEmail(storedEmail);
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none rounded-[1.5rem] shadow-2xl bg-white [&>button]:hidden">
                {/* ── Close button ── */}
                <button
                    onClick={() => setIsOpen(false)}
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
                                    className={`w-full h-12 text-left px-4 rounded-lg border transition-all text-sm font-medium ${selectedRoute === route.id
                                        ? "border-[#581c87] bg-purple-50 text-[#581c87]"
                                        : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50"
                                        } disabled:opacity-50`}
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

                        <button
                            onClick={() => setStep(2)}
                            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-bold text-white transition-colors"
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
