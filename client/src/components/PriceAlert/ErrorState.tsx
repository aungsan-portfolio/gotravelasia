"use client";

import { AlertCircle } from "lucide-react";

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center text-center gap-3 py-5">
            <AlertCircle size={40} className="text-red-400 mb-2" strokeWidth={1.5} />
            <span className="text-white/80 font-medium">Something went wrong</span>
            <span className="text-white/42 text-sm px-4">
                We couldn't save your alert. Please check your connection and try again.
            </span>
            <button
                onClick={onRetry}
                className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors text-sm"
            >
                Try Again
            </button>
        </div>
    );
}
