// client/src/components/flights/destination/FlightDeals.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import type {
  DealTabKey,
  DestinationPageVM,
  NormalizedDealVM,
} from "@/types/destination";

type FlightDealsProps = {
  data: DestinationPageVM;
};

const STOP_BADGE_STYLES: Record<
  NormalizedDealVM["stopBadgeTone"],
  string
> = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

function formatArrival(value: string): string {
  return value?.trim() || "—";
}

function resolveActiveTab(
  preferred: string,
  tabs: DestinationPageVM["deals"]["tabs"]
): string {
  const preferredTab = tabs.find((tab) => tab.key === preferred && tab.count > 0);
  if (preferredTab) return preferredTab.key;

  const firstAvailable = tabs.find((tab) => tab.count > 0);
  return firstAvailable?.key ?? preferred;
}

function DealCard({
  deal,
  destinationCity,
}: {
  deal: NormalizedDealVM;
  destinationCity: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-fuchsia-400/20 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {deal.logoUrl && (
              <img
                src={deal.logoUrl}
                alt={deal.airline}
                className="h-5 w-5 rounded object-contain bg-white/10"
              />
            )}
            <p className="truncate text-sm font-semibold text-white">
              {deal.airline}
            </p>

            {deal.badge ? (
              <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[11px] font-medium text-fuchsia-200">
                {deal.badge}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs text-white/55">
            {deal.from} → {deal.to}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Price
          </p>
          <p className="text-lg font-semibold text-amber-200">
            {deal.priceLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#100b21] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Departure
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {deal.departLabel}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#100b21] p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Arrival
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {formatArrival(deal.arrivalLabel)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STOP_BADGE_STYLES[deal.stopBadgeTone]}`}
        >
          {deal.isDirect ? "Direct" : `${deal.stops} stop${deal.stops === 1 ? "" : "s"}`}
        </span>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70">
          {deal.duration}
        </span>

        {deal.airlineCode ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70">
            {deal.airlineCode}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-white/45">Destination</p>
          <p className="truncate text-sm text-white/75">{destinationCity}</p>
        </div>

        <a
          href={deal.bookingUrl}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Book now
        </a>
      </div>
    </article>
  );
}

export default function FlightDeals({ data }: FlightDealsProps) {
  const { deals, route } = data;

  const [activeTab, setActiveTab] = useState<string>(
    resolveActiveTab(deals.activeTab, deals.tabs)
  );

  useEffect(() => {
    setActiveTab(resolveActiveTab(deals.activeTab, deals.tabs));
  }, [deals.activeTab, deals.tabs]);

  const currentTab = useMemo(() => {
    return (
      deals.tabs.find((tab) => tab.key === activeTab) ??
      deals.tabs.find((tab) => tab.count > 0) ??
      deals.tabs[0]
    );
  }, [activeTab, deals.tabs]);

  const summaryItems = [
    {
      label: "Average price",
      value: deals.summary.avgPriceLabel,
    },
    {
      label: "Cheapest carrier",
      value: deals.summary.cheapestCarrier ?? "—",
    },
    {
      label: "Direct deals",
      value: String(deals.summary.directCount),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            Deals
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {deals.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {deals.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {deals.tabs.map((tab) => {
          const isActive = tab.key === currentTab?.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-100"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              <span>{tab.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[11px]",
                  isActive
                    ? "bg-white/10 text-fuchsia-100"
                    : "bg-white/10 text-white/55",
                ].join(" ")}
              >
                {tab.count}
              </span>
              <span className="text-[11px] text-white/50">{tab.bestPriceLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              {route.routeLabel}
            </p>
            <p className="mt-1 text-xs text-white/55">
              {currentTab?.label ?? "Deals"} tab · {currentTab?.bestPriceLabel ?? "—"} best shown
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={data.seo.canonicalPath}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.08]"
            >
              Refresh route view
            </Link>

            <a
              href={route.bookingCtaHref}
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Search all fares
            </a>
          </div>
        </div>

        {currentTab && currentTab.items.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {currentTab.items.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                destinationCity={route.destination.city}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-[#100b21] p-6 text-center">
            <p className="text-sm font-medium text-white">
              No deals available in this tab yet.
            </p>
            <p className="mt-2 text-sm text-white/60">
              Try another tab or search the full route for more options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
