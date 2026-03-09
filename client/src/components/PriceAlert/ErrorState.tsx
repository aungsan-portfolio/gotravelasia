export default function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="text-center py-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_28px_rgba(220,38,38,0.25)]">
                <span className="text-[26px]">✕</span>
            </div>
            <h2 className="text-[24px] font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Oops!</h2>
            <div className="text-[13px] text-white/50 mb-4">Something went wrong. Please try again.</div>

            <button
                onClick={onRetry}
                className="px-6 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white/80 font-semibold text-[13px] hover:bg-white/20 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                Try Again
            </button>
        </div>
    );
}
