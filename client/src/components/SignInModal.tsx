/**
 * @file SignInModal.tsx
 * @description Cheapflights-inspired sign-in modal with Google + Email options.
 * 3-step flow: Buttons → Email Input → Route Selection
 * Uses Web3Forms (free) + localStorage for zero-budget email capture.
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
const WEB3FORMS_KEY = "606d35a5-9c09-4209-8317-96fba9a21c59";
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";

const WATCH_ROUTES = [
    { id: "rgn-bkk", label: "Yangon → Bangkok" },
    { id: "rgn-sin", label: "Yangon → Singapore" },
    { id: "rgn-cnx", label: "Yangon → Chiang Mai" },
    { id: "mdl-bkk", label: "Mandalay → Bangkok" },
    { id: "other", label: "Other Destinations" },
];

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
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1=buttons, 2=email, 3=routes, 4=done
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

    // ── Submit email to Web3Forms ──
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);

        try {
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: "🔔 New Subscriber — GoTravelAsia",
                    from_name: "GoTravel Sign In",
                    email,
                    message: `New sign-in subscriber: ${email}`,
                }),
            });
        } catch {
            // Silently fail — still save locally
        }

        localStorage.setItem(LS_EMAIL_KEY, email);
        localStorage.setItem(LS_SUBSCRIBED_KEY, "true");
        setIsSubscribed(true);
        setSavedEmail(email);
        setIsSubmitting(false);
        setStep(3); // → Route selection
    };

    // ── Save route & close ──
    const handleRouteSelect = (routeId: string) => {
        setSelectedRoute(routeId);
        localStorage.setItem("gt_alert_route", routeId);
        setStep(4);
        setTimeout(() => setIsOpen(false), 2000);
    };

    // ── Google click → email fallback (Firebase later) ──
    const handleGoogleClick = () => {
        setStep(2);
    };

    // ── Trigger button ──
    const defaultTrigger =
        variant === "mobile" ? (
            <Button
                variant="outline"
                className={`w-full justify-start font-mono text-xs uppercase ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "Sign In"}
            </Button>
        ) : (
            <Button
                variant="outline"
                className={`hidden sm:inline-flex font-mono text-xs uppercase tracking-wider ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "Sign In"}
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
                        <h2 className="text-2xl font-bold text-gray-900">Welcome! 🎉</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            We'll send exclusive deals to your inbox.
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1">{savedEmail}</p>
                    </div>
                )}

                {/* ═══════════ STEP 3: ROUTE SELECTION ═══════════ */}
                {step === 3 && (
                    <div className="px-8 pb-10 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
                            <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 size={18} /> Welcome to the inner circle!
                            </p>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            One more step...
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Which route should we watch first?
                        </p>

                        <div className="grid grid-cols-1 gap-2 mb-6">
                            {WATCH_ROUTES.map((route) => (
                                <button
                                    key={route.id}
                                    onClick={() => handleRouteSelect(route.id)}
                                    className={`w-full h-12 text-left px-4 rounded-lg border transition-all text-sm font-medium ${selectedRoute === route.id
                                            ? "border-[#581c87] bg-purple-50 text-[#581c87]"
                                            : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50"
                                        }`}
                                >
                                    {route.label}
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
                            We'll send you exclusive deals and price alerts.
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
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white font-bold text-lg shadow-lg shadow-purple-100 transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Continue"
                                )}
                            </Button>
                        </form>

                        <button
                            onClick={() => setStep(1)}
                            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
                        >
                            ← Back to sign in options
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

                {/* ═══════════ STEP 1: BUTTONS (Cheapflights Style) ═══════════ */}
                {step === 1 && (
                    <div className="px-8 pb-10 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Friendly Greeting */}
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                            Hi there.
                            <br />
                            <span className="text-[#581c87]">Nice to see you.</span>
                        </h2>

                        {/* Benefits intro */}
                        <p className="text-gray-500 mt-4 text-[15px] font-medium leading-relaxed">
                            Sign up to get some great benefits you're missing out on right
                            now:
                        </p>

                        {/* Bullet points with gold checks */}
                        <ul className="mt-4 mb-8 space-y-3">
                            {[
                                "Cheaper prices with member-only discounts",
                                "Instant alerts for Asia's best flight deals",
                                "Personalized trip planning tools",
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

                        {/* ── Google Button ── */}
                        <button
                            onClick={handleGoogleClick}
                            className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>

                        {/* "or" divider */}
                        <div className="flex items-center gap-3 py-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* ── Continue with Email ── */}
                        <button
                            onClick={() => setStep(2)}
                            className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Mail className="w-5 h-5 text-gray-500" />
                            Continue with email
                        </button>

                        {/* Legal */}
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
