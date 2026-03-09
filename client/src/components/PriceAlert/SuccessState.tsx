import type { DetectedRoute } from "@/lib/detectRouteFromContext";
import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
    step: "auto-saved" | "email-sent";
    email: string;
    toastMessage: string;
    detectedRoute?: DetectedRoute | null;
    onClose: () => void;
}

export default function SuccessState({ step, email, toastMessage, detectedRoute, onClose }: SuccessStateProps) {
    return (
        <div className="text-center py-6" style={{ animation: "gt-fade .4s ease" }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", boxShadow: "0 8px 28px rgba(74,222,128,.28)" }}>
                <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">You're in!</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
                {step === "auto-saved"
                    ? <><>Alert set for </><span className="text-amber-400">{detectedRoute?.label || "your route"}</span><></></>
                    : <><>Check </><span className="text-amber-400">{email || "your inbox"}</span><> for your login link ✉️</></>
                }
            </p>

            {/* Badges */}
            {step === "auto-saved" && detectedRoute && (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold">
                    ✈️ {detectedRoute.origin} → {detectedRoute.destination} · Auto-saved
                </div>
            )}

            {step === "email-sent" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-semibold">
                    📬 Welcome email sent
                </div>
            )}

            <p className="text-white/28 text-xs mb-3">
                {step === "auto-saved"
                    ? "We'll email you when price drops 🔔"
                    : "Choose routes from the email → we'll start watching"}
            </p>

            <button
                onClick={onClose}
                className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 font-semibold h-11 rounded-xl transition-all active:scale-[0.98] text-[13px]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                Got it, thanks!
            </button>
        </div>
    );
}
