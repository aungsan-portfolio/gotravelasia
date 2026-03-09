import { Loader2 } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="flex flex-col items-center gap-3 py-7">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-[13px] text-white/40">Saving your alert...</p>
        </div>
    );
}
