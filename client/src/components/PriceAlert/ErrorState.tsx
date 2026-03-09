import { AlertCircle } from "lucide-react";

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="text-center py-6" style={{ animation: "gt-fade .4s ease" }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#f87171,#dc2626)", boxShadow: "0 8px 28px rgba(220,38,38,.25)" }}>
                <AlertCircle size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="gt-head text-white text-2xl font-extrabold mb-2">Oops!</h2>
            <p className="text-white/50 text-sm mb-5">Something went wrong. Please try again.</p>
            <button
                onClick={onRetry}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-all"
                style={{ background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
                Try Again
            </button>
        </div>
    );
}
