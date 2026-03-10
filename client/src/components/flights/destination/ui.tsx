import { ReactNode } from "react";
import { Plane } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind class merging
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── Layout ────────────────────────────────────────────────────────
export interface WrapProps {
    children: ReactNode;
    className?: string;
    py?: number;
}

export const Wrap = ({ children, className = "" }: WrapProps) => (
    <div className={cn("max-w-[1100px] mx-auto px-6", className)}>
        {children}
    </div>
);

export interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
    <div className={cn(
        "bg-white/[0.035] border border-white/[0.08] rounded-2xl shadow-lg",
        className
    )}>
        {children}
    </div>
);

export const HR = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
);

// ── Typography ───────────────────────────────────────────────────
export const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h2 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight mb-2">
        {children}
    </h2>
);

export const SectionSub = ({ children }: { children: ReactNode }) => (
    <p className="text-[13px] text-slate-400 font-medium mb-6 max-w-2xl leading-relaxed">
        {children}
    </p>
);

// ── Badges & Indicators ──────────────────────────────────────────
export const StopBadge = ({ stops }: { stops: number }) => {
    if (stops === 0) return <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">Direct</span>;
    if (stops === 1) return <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">1 stop</span>;
    return <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full inline-block">{stops} stops</span>;
};

// ── Buttons ──────────────────────────────────────────────────────
export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    ch?: ReactNode; // Legacy support from JSX version
    className?: string;
}

export const AmberBtn = ({ children, ch, className = "", ...props }: BtnProps) => (
    <button
        className={cn(
            "bg-amber-500 text-[#0b0719] font-black rounded-xl hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-[0.98]",
            className
        )}
        {...props}
    >
        {children || ch}
    </button>
);

export interface GhostBtnProps extends BtnProps {
    active?: boolean;
}

export const GhostBtn = ({ children, active, className = "", ...props }: GhostBtnProps) => (
    <button
        className={cn(
            "rounded-full font-bold transition-all border",
            active
                ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                : "bg-transparent text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200",
            className
        )}
        {...props}
    >
        {children}
    </button>
);

// ── Charts & Visuals ─────────────────────────────────────────────
interface ChartTooltipProps {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
    fmt?: (v: number) => string;
}

export const ChartTooltip = ({ active, payload, label, fmt }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
        const v = payload[0].value;
        return (
            <div className="bg-[#0b0719]/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg shadow-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</div>
                <div className="text-[13px] font-black text-slate-100">{fmt ? fmt(v) : `฿${v.toLocaleString()}`}</div>
            </div>
        );
    }
    return null;
};

export const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1.5 font-semibold">
            <span className="text-slate-400">{label}</span>
            <span className="text-slate-100">{score.toFixed(1)}</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
                className={cn(
                    "h-full rounded-full",
                    score >= 8 ? "bg-emerald-500" : score >= 7 ? "bg-cyan-400" : "bg-violet-500"
                )}
                style={{ width: `${score * 10}%` }}
            />
        </div>
    </div>
);
