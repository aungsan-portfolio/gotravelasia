import { useEffect, useState } from "react";
import { Cookie, Shield, BarChart2, Megaphone, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LAST_UPDATED = "March 6, 2026";

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

interface ToggleRowProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    locked?: boolean;
    lockedType?: "on" | "off";
    onChange?: (val: boolean) => void;
}

function ToggleRow({ icon, title, description, enabled, locked, lockedType = "on", onChange }: ToggleRowProps) {
    return (
        <Card className="p-5 border border-border flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-end">
                        {locked ? (
                            <span className="text-xs font-mono px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                                {lockedType === "on" ? "Always On" : "Disabled"}
                            </span>
                        ) : (
                            <button
                                role="switch"
                                aria-checked={enabled}
                                onClick={() => onChange?.(!enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? "bg-primary" : "bg-muted"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function CookieSettings() {
    const [prefs, setPrefs] = useState<CookiePreferences>({
        necessary: true,
        analytics: true,
        marketing: false,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.title = "Cookie Settings — GoTravel Asia";

        // Load saved prefs from localStorage if available
        try {
            const stored = localStorage.getItem("gotravel_cookie_prefs");
            if (stored) {
                const parsed = JSON.parse(stored);
                setPrefs((p) => ({ ...p, ...parsed, necessary: true }));
            }
        } catch {
            // ignore
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem("gotravel_cookie_prefs", JSON.stringify(prefs));
        } catch {
            // ignore
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleAcceptAll = () => {
        const all = { necessary: true, analytics: true, marketing: false };
        setPrefs(all);
        try {
            localStorage.setItem("gotravel_cookie_prefs", JSON.stringify(all));
        } catch { }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero */}
            <div className="bg-primary/5 border-b border-border py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Cookie className="w-8 h-8 text-primary" />
                        <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                            Privacy
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Settings</h1>
                    <p className="text-muted-foreground text-sm">
                        Last updated: {LAST_UPDATED}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
                {/* Intro */}
                <p className="text-muted-foreground leading-relaxed p-4 bg-muted/30 rounded-lg border border-border text-sm">
                    GoTravel Asia uses cookies to improve your experience and understand how visitors use our
                    site. You can choose which cookies to allow below. Your preferences are saved in your
                    browser and can be changed at any time.
                </p>

                {/* Toggles */}
                <div className="space-y-4">
                    <ToggleRow
                        icon={<Shield className="w-4 h-4" />}
                        title="Strictly Necessary"
                        description="Essential for the website to function. Cannot be disabled. Includes session management and security tokens."
                        enabled={true}
                        locked={true}
                        lockedType="on"
                    />
                    <ToggleRow
                        icon={<BarChart2 className="w-4 h-4" />}
                        title="Analytics"
                        description="Helps us understand how visitors interact with the website by collecting anonymous usage data. No personal information is stored."
                        enabled={prefs.analytics}
                        onChange={(val) => setPrefs((p) => ({ ...p, analytics: val }))}
                    />
                    <ToggleRow
                        icon={<Megaphone className="w-4 h-4" />}
                        title="Marketing"
                        description="Used to track visitors across websites to display relevant advertisements. Currently not active on GoTravel Asia."
                        enabled={false}
                        locked={true}
                        lockedType="off"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Button onClick={handleSave} className="flex items-center gap-2">
                        {saved ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Preferences
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={handleAcceptAll}>
                        Accept All
                    </Button>
                </div>

                {saved && (
                    <p className="text-sm text-emerald-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Your cookie preferences have been saved.
                    </p>
                )}

                {/* Info */}
                <div className="pt-6 border-t border-border text-sm text-muted-foreground space-y-3">
                    <h2 className="font-semibold text-foreground text-base">What are cookies?</h2>
                    <p>
                        Cookies are small text files stored on your device when you visit a website. They help
                        websites remember your preferences, keep you logged in, and collect anonymous usage data
                        to improve the experience.
                    </p>
                    <p>
                        For more details on how we handle your data, please read our{" "}
                        <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
