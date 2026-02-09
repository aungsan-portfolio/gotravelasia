import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "wouter";

const COOKIE_CONSENT_KEY = "gotravel_cookie_consent";

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="container max-w-4xl">
                <div className="bg-card border border-border shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{t("cookie.title")}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t("cookie.message")}{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                {t("cookie.learnMore")}
                            </Link>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDecline}
                            className="text-xs font-mono uppercase"
                        >
                            {t("cookie.decline")}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            className="text-xs font-mono uppercase bg-primary text-primary-foreground"
                        >
                            {t("cookie.accept")}
                        </Button>
                    </div>
                    <button
                        onClick={handleDecline}
                        className="absolute top-2 right-2 sm:hidden text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

