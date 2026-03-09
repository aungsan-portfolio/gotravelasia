// ── Shared UI primitives for FloatingSearchBar ────────────────────

import React from "react";

// ── Pill ──────────────────────────────────────────────────────────
export function Pill({
    id, active, onClick, children, className = "",
}: {
    id?: string; active?: boolean;
    onClick?: () => void; children: React.ReactNode; className?: string;
}) {
    return (
        <div
            id={id}
            onClick={onClick}
            className={[
                "relative h-[30px] rounded-[7px] border flex items-center gap-[5px] px-[9px]",
                "text-[12px] font-semibold text-white cursor-pointer whitespace-nowrap flex-shrink-0",
                "transition-all duration-150 select-none",
                active
                    ? "border-[#F5C518] bg-[rgba(245,197,24,0.15)] shadow-[0_0_0_3px_rgba(245,197,24,0.12)]"
                    : "border-transparent bg-[rgba(255,255,255,0.07)] hover:border-[rgba(245,197,24,0.35)] hover:bg-[rgba(245,197,24,0.10)]",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}

// ── PillX clear button ────────────────────────────────────────────
export function PillX({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
    return (
        <span
            onClick={onClick}
            className="w-[13px] h-[13px] rounded-full bg-white/15 flex items-center justify-center text-[8px] text-white/70 flex-shrink-0 transition-all hover:bg-[rgba(245,197,24,0.35)] hover:text-[#F5C518]"
        >
            ×
        </span>
    );
}

// ── Caret ─────────────────────────────────────────────────────────
export function Caret({ open }: { open?: boolean }) {
    return (
        <span className={`text-[8px] text-white/30 transition-transform duration-150 ${open ? "rotate-180 text-[#F5C518]" : ""}`}>
            ▾
        </span>
    );
}

// ── Separator ─────────────────────────────────────────────────────
export function Sep() {
    return <div className="w-px h-[18px] bg-[rgba(255,255,255,0.1)] flex-shrink-0 mx-[3px]" />;
}

// ── DropPanel (dropdown container) ────────────────────────────────
export function DropPanel({
    children, left = 0, right, width, onClick,
}: {
    children: React.ReactNode;
    left?: number | "auto"; right?: number | "auto"; width?: number;
    onClick?: (e: React.MouseEvent) => void;
}) {
    return (
        <div
            onClick={onClick ?? (e => e.stopPropagation())}
            className="absolute top-[calc(100%+8px)] z-[9999] rounded-[14px] border border-[rgba(245,197,24,0.2)] p-[10px] shadow-[0_16px_50px_rgba(0,0,0,0.7)]"
            style={{
                background: "#130630",
                left: left !== "auto" ? left : undefined,
                right: right !== "auto" ? right : undefined,
                width: width ?? 200,
                animation: "dropIn .18s cubic-bezier(.34,1.4,.64,1) both",
            }}
        >
            {children}
        </div>
    );
}

// ── DropOpt (dropdown option row) ─────────────────────────────────
export function DropOpt({ children, selected, onClick }: {
    children: React.ReactNode; selected?: boolean; onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={[
                "flex items-center px-[12px] py-[9px] rounded-[9px] cursor-pointer text-[13px] font-[600] transition-all",
                selected
                    ? "bg-[rgba(245,197,24,0.12)] text-[#F5C518]"
                    : "text-[rgba(255,255,255,0.55)] hover:bg-[rgba(245,197,24,0.1)] hover:text-white",
            ].join(" ")}
        >
            {children}
        </div>
    );
}

// ── NavBtn (calendar month nav) ───────────────────────────────────
export function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="w-[26px] h-[26px] rounded-[7px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] flex items-center justify-center cursor-pointer text-[rgba(255,255,255,0.6)] text-[12px] transition-all hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.4)] hover:text-[#F5C518]"
        >
            {children}
        </div>
    );
}

// ── CountBtn (pax counter +/−) ────────────────────────────────────
export function CountBtn({ children, onClick, disabled }: {
    children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={[
                "w-[26px] h-[26px] rounded-[7px] border flex items-center justify-center text-[14px] font-[600] transition-all",
                disabled
                    ? "opacity-25 cursor-default border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white"
                    : "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] text-white cursor-pointer hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.4)] hover:text-[#F5C518]",
            ].join(" ")}
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        >
            {children}
        </button>
    );
}
