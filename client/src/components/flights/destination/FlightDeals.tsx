// client/src/components/flights/destination/FlightDeals.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeAgo } from "@/lib/timeAgo";
import type { DestinationPageVM, NormalizedDealVM } from "@/types/destination";

type FlightDealsProps = {
  data: DestinationPageVM;
  filteredTabItems?: Partial<Record<string, NormalizedDealVM[]>>;
};

// Cheapflights-style deal classification tabs
type DealClass = "all" | "cheapest" | "best" | "direct" | "oneway";
const DEAL_CLASSES: { key: DealClass; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "cheapest", label: "Cheapest" },
  { key: "best",     label: "Best" },
  { key: "direct",   label: "Direct" },
  { key: "oneway",   label: "One-way" },
];

const STOP_BADGE_STYLES: Record<NormalizedDealVM["stopBadgeTone"], string> = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30  bg-amber-400/10  text-amber-200",
  red:   "border-rose-400/30   bg-rose-400/10   text-rose-200",
};

function classifyDeals(items: NormalizedDealVM[], cls: DealClass): NormalizedDealVM[] {
  switch (cls) {
    case "cheapest":
      return [...items].sort((a, b) => a.price - b.price).slice(0, 5);
    case "best": {
      // "Best" = good balance of price + direct preference
      const sorted = [...items].sort((a, b) => {
        const aScore = a.price * (a.stops === 0 ? 0.85 : 1);
        const bScore = b.price * (b.stops === 0 ? 0.85 : 1);
        return aScore - bScore;
      });
      return sorted.slice(0, 5);
    }
    case "direct":
      return items.filter((d) => d.isDirect);
    case "oneway":
      // "One-way" = 40% cheapest of the results as representative
      return [...items]
        .sort((a, b) => a.price - b.price)
        .slice(0, 3)
        .map((d) => ({ ...d, tag: "One-way" }));
    default:
      return items;
  }
}

function DealCard({ deal }: { deal: NormalizedDealVM }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">

      {/* Airline logo + name */}
      <div className="flex shrink-0 items-center gap-3">
        {deal.logoUrl && (
          <img src={deal.logoUrl} alt={deal.airline} className="h-8 w-8 rounded-md object-contain" />
        )}
        <div>
          <p className="text-sm font-semibold text-white">{deal.airline}</p>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {deal.badge && (
              <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${STOP_BADGE_STYLES[deal.stopBadgeTone]}`}>
                {deal.badge}
              </span>
            )}
            {deal.tag && (
              <span className="inline-block rounded border border-fuchsia-400/30 bg-fuchsia-400/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-fuchsia-300">
                {deal.tag}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Route + times */}
      <div className="hidden flex-1 gap-4 sm:flex">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Departure</p>
          <p className="text-sm text-white/80">{deal.departLabel}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Duration</p>
          <p className="text-sm text-white/80">{deal.duration}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Route</p>
          <p className="text-sm text-white/80">{deal.from} → {deal.to}</p>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-lg font-bold text-amber-400">{deal.priceLabel}</p>
        <a
          href={deal.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-amber-300"
        >
          Book now
        </a>
        {deal.found_at && (
          <p className="mt-0.5 text-right text-[10px] text-white/40">
            {formatTimeAgo(deal.found_at)}
          </p>
        )}
      </div>
    </div>
  );
}

function resolveActiveTab(preferred: string, tabs: DestinationPageVM["deals"]["tabs"]): string {
  const found = tabs.find((t) => t.key === preferred && t.count > 0);
  if (found) return found.key;
  return tabs.find((t) => t.count > 0)?.key ?? preferred;
}

export default function FlightDeals({
  data,
  filteredTabItems,
}: FlightDealsProps) {
  const { deals, route } = data;

  const [activeTab, setActiveTab] = useState(() =>
    resolveActiveTab(deals.activeTab, deals.tabs)
  );
  const [dealClass, setDealClass] = useState<DealClass>("all");
  const [directOnly, setDirectOnly] = useState(false);

  useEffect(() => {
    setActiveTab(resolveActiveTab(deals.activeTab, deals.tabs));
  }, [deals.activeTab, deals.tabs]);

  const ribbonRef = useRef<HTMLDivElement>(null);

  const currentTab = useMemo(
    () =>
      deals.tabs.find(t => t.key === activeTab) ??
      deals.tabs.find(t => t.count > 0) ??
      deals.tabs[0],
    [activeTab, deals.tabs]
  );

  const currentTabItems = useMemo(() => {
    if (!currentTab) return [];
    return filteredTabItems?.[currentTab.key] ?? currentTab.items;
  }, [currentTab, filteredTabItems]);

  // Apply direct-only filter then deal classification
  const visibleDeals = useMemo(() => {
    let items = currentTabItems;
    if (directOnly) items = items.filter(d => d.isDirect);
    return classifyDeals(items, dealClass);
  }, [currentTabItems, dealClass, directOnly]);

  function scrollRibbon(dir: "left" | "right") {
    ribbonRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  }

  const summaryItems = [
    { label: "Average price",    value: deals.summary.avgPriceLabel },
    { label: "Cheapest carrier", value: deals.summary.cheapestCarrier ?? "—" },
    { label: "Direct deals",     value: String(deals.summary.directCount) },
  ];

  const directCount = currentTabItems.filter(d => d.isDirect).length;

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Deals</p>
            <h2 className="text-xl font-bold text-white">{deals.title}</h2>
            <p className="text-sm text-slate-400">{deals.subtitle}</p>
          </div>
          <div className="flex gap-4">
            {summaryItems.map((item) => (
              <div key={item.label} className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-white/40">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Month ribbon ── */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollRibbon("left")}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1 text-white/60 transition hover:bg-white/[0.10] hover:text-white"
            aria-label="Scroll months left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={ribbonRef}
            className="flex flex-1 gap-2 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {deals.tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "flex shrink-0 flex-col items-center rounded-xl border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-amber-400 bg-amber-400 text-slate-900"
                      : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  <span className="whitespace-nowrap font-semibold">{tab.label}</span>
                  <span
                    className={`mt-0.5 text-xs ${isActive ? "text-slate-700" : "text-amber-400"}`}
                  >
                    {filteredTabItems?.[tab.key]?.[0]?.priceLabel ??
                      tab.bestPriceLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollRibbon("right")}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1 text-white/60 transition hover:bg-white/[0.10] hover:text-white"
            aria-label="Scroll months right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ── Deal Classification Tabs (Cheapest / Best / Direct / One-way) ── */}
        <div className="flex flex-wrap items-center gap-2">
          {DEAL_CLASSES.map((cls) => {
            const isActive = dealClass === cls.key;
            const isEmpty = cls.key === "direct" && directCount === 0;
            return (
              <button
                key={cls.key}
                type="button"
                disabled={isEmpty}
                onClick={() => setDealClass(cls.key)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  isEmpty
                    ? "cursor-not-allowed border-white/5 text-white/20"
                    : isActive
                    ? "border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-300"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
                ].join(" ")}
              >
                {cls.label}
                {cls.key === "direct" && directCount > 0 && (
                  <span className="ml-1 opacity-60">({directCount})</span>
                )}
              </button>
            );
          })}

          {/* Direct-only toggle */}
          <button
            type="button"
            onClick={() => setDirectOnly((v) => !v)}
            className={[
              "ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
              directOnly
                ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
            ].join(" ")}
            aria-pressed={directOnly}
          >
            <span
              className={[
                "inline-block h-2 w-2 rounded-full transition",
                directOnly ? "bg-emerald-400" : "bg-white/20",
              ].join(" ")}
            />
            Direct only
          </button>
        </div>

        {/* Active tab info bar */}
        {currentTab && (
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>
              {route.routeLabel} ·{" "}
              <span className="text-white/60">{currentTab.label}</span> · best
              from{" "}
              <span className="text-amber-400 font-semibold">
                {visibleDeals[0]?.priceLabel ?? currentTab.bestPriceLabel}
              </span>
              {dealClass !== "all" && (
                <span className="ml-2 rounded bg-fuchsia-400/10 px-1.5 text-fuchsia-300">
                  {DEAL_CLASSES.find(c => c.key === dealClass)?.label}
                </span>
              )}
            </span>
            <Link href={route.bookingCtaHref} className="text-fuchsia-400 hover:underline">
              Search all fares →
            </Link>
          </div>
        )}

        {/* Deal cards */}
        {visibleDeals.length > 0 ? (
          <div className="space-y-3">
            {visibleDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-sm font-medium text-white/60">
              {directOnly
                ? "No direct flights available for this month."
                : "No deals match your filters for this month."}
            </p>
            <p className="mt-1 text-xs text-white/30">
              {directOnly
                ? "Try disabling 'Direct only' or select another month."
                : "Try another month or search all fares."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
