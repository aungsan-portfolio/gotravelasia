// client/src/components/flights/destination/ui.tsx

import type {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Utils ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PolymorphicProps<E extends ElementType, P = {}> = P & {
  as?: E;
  className?: string;
} & Omit<ComponentPropsWithoutRef<E>, keyof P | "as" | "className">;

// ── Layout primitives ────────────────────────────────────────────

export function SectionShell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Surface({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Panel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-white/10 bg-[#100b21] p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Kicker({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function SectionSub({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function StatCard({
  label,
  value,
  subValue,
  className,
}: {
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3", className)}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
      {subValue ? <p className="mt-1 text-xs text-white/55">{subValue}</p> : null}
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────

type BaseButtonOwnProps = {
  children: ReactNode;
  loading?: boolean;
};

export function AmberBtn<E extends ElementType = "button">({
  as,
  className,
  children,
  loading,
  ...props
}: PolymorphicProps<E, BaseButtonOwnProps>) {
  const Comp = (as ?? "button") as ElementType;
  const isButton = Comp === "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...(isButton ? { type: "button" } : {})}
      {...props}
    >
      {loading ? "Loading..." : children}
    </Comp>
  );
}

export function GhostBtn<E extends ElementType = "button">({
  as,
  className,
  children,
  loading,
  ...props
}: PolymorphicProps<E, BaseButtonOwnProps>) {
  const Comp = (as ?? "button") as ElementType;
  const isButton = Comp === "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...(isButton ? { type: "button" } : {})}
      {...props}
    >
      {loading ? "Loading..." : children}
    </Comp>
  );
}

// ── Status / badges ──────────────────────────────────────────────

export function StopBadge({
  stops,
  label,
  className,
}: {
  stops: number;
  label?: string;
  className?: string;
}) {
  const toneClass =
    stops <= 0
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : stops === 1
        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : "border-rose-400/30 bg-rose-400/10 text-rose-200";

  const text =
    label ??
    (stops <= 0 ? "Direct" : `${stops} stop${stops === 1 ? "" : "s"}`);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClass,
        className
      )}
    >
      {text}
    </span>
  );
}

export function StatusPill({
  tone = "amber",
  children,
  className,
}: {
  tone?: "green" | "amber" | "red" | "violet";
  children: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
      : tone === "red"
        ? "border-rose-400/25 bg-rose-400/10 text-rose-100"
        : tone === "violet"
          ? "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100"
          : "border-amber-400/25 bg-amber-400/10 text-amber-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Charts / scoring ─────────────────────────────────────────────

export function ScoreBar({
  value,
  max = 10,
  className,
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  label?: ReactNode;
}) {
  const normalized = Math.min(100, Math.max(0, (value / max) * 100));

  const fillTone =
    value >= max * 0.8
      ? "from-emerald-400 to-emerald-300"
      : value >= max * 0.7
        ? "from-amber-400 to-amber-300"
        : "from-rose-400 to-rose-300";

  return (
    <div className={cn("w-full", className)}>
      {label ? <div className="mb-2 text-xs text-white/60">{label}</div> : null}
      <div className="h-2 rounded-full bg-white/10">
        <div
          className={cn("h-2 rounded-full bg-gradient-to-r", fillTone)}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}

export function ChartTooltip({
  title,
  rows,
  className,
}: {
  title?: ReactNode;
  rows: Array<{ label: ReactNode; value: ReactNode; color?: string }>;
  className?: string;
}) {
  if (!rows.length) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-[#120d25]/95 px-3 py-2 text-xs text-white shadow-xl",
        className
      )}
    >
      {title ? <div className="font-medium text-white">{title}</div> : null}
      <div className={cn(title ? "mt-2 space-y-1" : "space-y-1")}>
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            {row.color ? (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            ) : null}
            <span className="text-white/65">{row.label}</span>
            <span className="ml-auto text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty / helper blocks ────────────────────────────────────────

export function EmptyState({
  title,
  description,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/10 bg-[#100b21] p-6 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-white">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-white/60">{description}</p>
      ) : null}
    </div>
  );
}

export function Divider({
  className,
  ...props
}: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("border-0 border-t border-white/10", className)}
      {...props}
    />
  );
}
