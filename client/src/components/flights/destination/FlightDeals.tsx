// client/src/components/flights/destination/FlightDeals.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DestinationPageVM, NormalizedDealVM } from "@/types/destination";

type FlightDealsProps = { data: DestinationPageVM };

const STOP_BADGE_STYLES: Record<NormalizedDealVM["stopBadgeTone"], string> = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30  bg-amber-400/10  text-amber-200",
  red:   "border-rose-400/30   bg-rose-400/10   text-rose-200",
};

function DealCard({ deal, destinationCity }: { deal: NormalizedDealVM; destinationCity: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">

      {/* Airline logo + name */}
      <div className="flex shrink-0 items-center gap-3">
        {deal.logoUrl && (
          <img src={deal.logoUrl} alt={deal.airline} className="h-8 w-8 rounded-md object-contain" />
        )}
        <div>
          <p className="text-sm font-semibold text-white">{deal.airline}</p>
          {deal.badge && (
            <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${STOP_BADGE_STYLES[deal.stopBadgeTone]}`}>
              {deal.badge}
            </span>
          )}
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
      </div>
    </div>
  );
}

function resolveActiveTab(preferred: string, tabs: DestinationPageVM["deals"]["tabs"]): string {
  const found = tabs.find((t) => t.key === preferred && t.count > 0);
  if (found) return found.key;
  return tabs.find((t) => t.count > 0)?.key ?? preferred;
}

export default function FlightDeals({ data }: FlightDealsProps) {
  const { deals, route } = data;

  const [activeTab, setActiveTab] = useState(() =>
    resolveActiveTab(deals.activeTab, deals.tabs)
  );

  useEffect(() => {
    setActiveTab(resolveActiveTab(deals.activeTab, deals.tabs));
  }, [deals.activeTab, deals.tabs]);

  const ribbonRef = useRef<HTMLDivElement>(null);

  const currentTab = useMemo(
    () => deals.tabs.find((t) => t.key === activeTab) ?? deals.tabs.find((t) => t.count > 0) ?? deals.tabs[0],
    [activeTab, deals.tabs],
  );

  function scrollRibbon(dir: "left" | "right") {
    ribbonRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  }

  const summaryItems = [
    { label: "Average price",    value: deals.summary.avgPriceLabel },
    { label: "Cheapest carrier", value: deals.summary.cheapestCarrier ?? "—" },
    { label: "Direct deals",     value: String(deals.summary.directCount) },
  ];

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
                  <span className={`mt-0.5 text-xs ${isActive ? "text-slate-700" : "text-amber-400"}`}>
                    {tab.bestPriceLabel}
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

        {/* Active tab info bar */}
        {currentTab && (
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>
              {route.routeLabel} · <span className="text-white/60">{currentTab.label}</span>
              {" "}· best from <span className="text-amber-400 font-semibold">{currentTab.bestPriceLabel}</span>
            </span>
            <Link href={route.bookingCtaHref} className="text-fuchsia-400 hover:underline">
              Search all fares →
            </Link>
          </div>
        )}

        {/* Deal cards */}
        {currentTab && currentTab.items.length > 0 ? (
          <div className="space-y-3">
            {currentTab.items.map((deal) => (
              <DealCard key={deal.id} deal={deal} destinationCity={route.destination.city} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-sm font-medium text-white/60">No deals available for this month.</p>
            <p className="mt-1 text-xs text-white/30">Try another month or search all fares.</p>
          </div>
        )}
      </div>
    </section>
  );
}
