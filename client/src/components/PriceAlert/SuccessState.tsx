import type { DetectedRoute } from "@/lib/detectRouteFromContext";

interface SuccessStateProps {
    step: "auto-saved" | "email-sent";
    email: string;
    toastMessage: string;
    detectedRoute?: DetectedRoute | null;
    onClose: () => void;
}

export default function SuccessState({ step, email, toastMessage, detectedRoute, onClose }: SuccessStateProps) {
    return (
        <div className="text-center py-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_28px_rgba(74,222,128,0.28)]">
                {step === "auto-saved" ? <span className="text-[26px]">✓</span> : <span className="text-[26px]">✉️</span>}
            </div>
            <h2 className="text-[24px] font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>You're in!</h2>

            {/* Subtext differences based on step */}
            {step === "auto-saved" ? (
                <div className="text-[13px] text-white/50 leading-[1.6]">
                    Alert set for <span className="text-amber-400">{detectedRoute?.label || "your route"}</span> ✓
                </div>
            ) : (
                <div className="text-[13px] text-white/50 leading-[1.6]">
                    Check <span className="text-amber-400">{email || "your inbox"}</span> to pick your routes
                </div>
            )}

            {/* Badges */}
            {step === "auto-saved" && detectedRoute && (
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold">
                    ✈️ {detectedRoute.origin} → {detectedRoute.destination} · Auto-saved
                </div>
            )}

            {step === "email-sent" && (
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-semibold">
                    📬 Welcome email sent
                </div>
            )}

            {/* Help notes */}
            {step === "auto-saved" ? (
                <div className="text-[11px] text-white/30 mt-1.5">We'll email you when price drops 🔔</div>
            ) : (
                <div className="text-[11px] text-white/30 mt-1.5">Choose routes from the email → we'll start watching</div>
            )}

            <button
                onClick={onClose}
                className="mt-6 w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 font-semibold h-11 rounded-xl transition-all active:scale-[0.98] text-[13px]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                Got it, thanks!
            </button>
        </div>
    );
}
