import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Heart, CheckCircle, Loader2 } from "lucide-react";

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const WEB3FORMS_KEY = "606d35a5-9c09-4209-8317-96fba9a21c59";
const LS_EMAIL_KEY = "gt_user_email";
const LS_SUBSCRIBED_KEY = "gt_subscribed";

// ──────────────────────────────────────────────
// Route options for Price Alerts
// ──────────────────────────────────────────────
const ALERT_ROUTES = [
    { id: "rgn-bkk", label: "Yangon → Bangkok" },
    { id: "rgn-sin", label: "Yangon → Singapore" },
    { id: "rgn-cnx", label: "Yangon → Chiang Mai" },
    { id: "mdl-bkk", label: "Mandalay → Bangkok" },
    { id: "rgn-kul", label: "Yangon → Kuala Lumpur" },
    { id: "rgn-hkt", label: "Yangon → Phuket" },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface SignInModalProps {
    /** Override the trigger element. If not provided, renders a default button. */
    trigger?: React.ReactNode;
    /** Additional class for the trigger wrapper */
    className?: string;
    /** Variant for the default trigger button */
    variant?: "header" | "mobile";
}

export default function SignInModal({ trigger, className, variant = "header" }: SignInModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>(["rgn-bkk"]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");

    // Check localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(LS_SUBSCRIBED_KEY);
        const storedEmail = localStorage.getItem(LS_EMAIL_KEY);
        if (stored === "true" && storedEmail) {
            setIsSubscribed(true);
            setSavedEmail(storedEmail);
        }
    }, []);

    const toggleRoute = (id: string) => {
        setSelectedRoutes((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || selectedRoutes.length === 0) return;

        setIsSubmitting(true);

        try {
            // Send to Web3Forms (free, no backend needed)
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: "🔔 New Price Alert Subscriber — GoTravelAsia",
                    from_name: "GoTravel Price Alerts",
                    email: email,
                    routes: selectedRoutes
                        .map((id) => ALERT_ROUTES.find((r) => r.id === id)?.label)
                        .join(", "),
                    message: `New subscriber: ${email}\nRoutes: ${selectedRoutes.join(", ")}`,
                }),
            });

            if (response.ok) {
                // Save to localStorage
                localStorage.setItem(LS_EMAIL_KEY, email);
                localStorage.setItem(LS_SUBSCRIBED_KEY, "true");
                localStorage.setItem("gt_alert_routes", JSON.stringify(selectedRoutes));

                setIsSubscribed(true);
                setSavedEmail(email);

                // Close after brief success state
                setTimeout(() => setIsOpen(false), 2000);
            } else {
                throw new Error("Submission failed");
            }
        } catch {
            // Fallback: still save locally even if API fails
            localStorage.setItem(LS_EMAIL_KEY, email);
            localStorage.setItem(LS_SUBSCRIBED_KEY, "true");
            localStorage.setItem("gt_alert_routes", JSON.stringify(selectedRoutes));
            setIsSubscribed(true);
            setSavedEmail(email);
            setTimeout(() => setIsOpen(false), 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Default trigger buttons ──
    const defaultTrigger =
        variant === "mobile" ? (
            <Button
                variant="outline"
                className={`w-full justify-start font-mono text-xs uppercase ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "🔔 Price Alerts"}
            </Button>
        ) : (
            <Button
                variant="outline"
                className={`hidden sm:inline-flex font-mono text-xs uppercase tracking-wider ${className || ""}`}
            >
                {isSubscribed ? `✅ ${savedEmail.split("@")[0]}` : "🔔 Price Alerts"}
            </Button>
        );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
                {/* ── Success State ── */}
                {isSubscribed ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Welcome to GoTravel! 🎉
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">
                            Price alerts activated for your routes. We'll email you when deals drop.
                        </p>
                        <p className="text-sm font-mono text-primary">{savedEmail}</p>
                    </div>
                ) : (
                    /* ── Sign-up Form ── */
                    <>
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-center text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                                    Unlock Secret Deals 🔓
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-white/80 mt-2 text-sm">
                                Enter your email to get prices we can't show publicly
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Benefits */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                                        <Bell size={16} className="text-primary" />
                                    </div>
                                    <span>
                                        Instant <strong>Price Alerts</strong> for Thailand & Southeast Asia
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                                        <Lock size={16} className="text-blue-600" />
                                    </div>
                                    <span>
                                        Access <strong>member-only</strong> flight rates
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                        <Heart size={16} className="text-red-500" />
                                    </div>
                                    <span>
                                        Save your <strong>favorite routes</strong> & destinations
                                    </span>
                                </div>
                            </div>

                            {/* Route Selection */}
                            <div>
                                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                                    Alert me for these routes
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALERT_ROUTES.map((route) => (
                                        <button
                                            key={route.id}
                                            type="button"
                                            onClick={() => toggleRoute(route.id)}
                                            className={`text-xs py-2 px-3 border rounded-md transition-all text-left ${selectedRoutes.includes(route.id)
                                                    ? "bg-primary/10 border-primary text-primary font-medium"
                                                    : "border-border text-muted-foreground hover:border-primary/50"
                                                }`}
                                        >
                                            {selectedRoutes.includes(route.id) ? "✓ " : ""}
                                            {route.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 border border-input bg-background text-foreground rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || selectedRoutes.length === 0}
                                    className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Subscribing...
                                        </>
                                    ) : (
                                        "Continue with Email →"
                                    )}
                                </Button>
                            </form>

                            {/* Legal */}
                            <p className="text-center text-xs text-muted-foreground leading-tight">
                                By continuing, you accept our{" "}
                                <a href="/terms" className="underline hover:text-foreground">
                                    Terms
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="underline hover:text-foreground">
                                    Privacy Policy
                                </a>
                                . No spam, unsubscribe anytime.
                            </p>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
