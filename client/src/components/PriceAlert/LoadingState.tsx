import { Loader2 } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="flex flex-col items-center gap-3 py-5">
            <Loader2
                size={28}
                className="text-amber-400"
                style={{ animation: "gt-spin .7s linear infinite" }}
            />
            <span className="text-white/42 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Saving your alert...</span>
        </div>
    );
}
