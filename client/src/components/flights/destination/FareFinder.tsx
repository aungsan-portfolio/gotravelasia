// client/src/components/flights/destination/FareFinder.tsx

import { useEffect, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import type {
  DestinationPageVM,
  NormalizedFareEntryVM,
} from "@/types/destination";

type FareFinderProps = {
  data: DestinationPageVM;
};

const STOP_BADGE_STYLES: Record<
  NormalizedFareEntryVM["outbound"]["stopBadgeTone"],
  string
> = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

function formatBudget(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

function FareLegCard({
  title,
  leg,
}: {
  title: string;
  leg: NormalizedFareEntryVM["outbound"];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#100b21] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{leg.route}</p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STOP_BADGE_STYLES[leg.stopBadgeTone]}`}
        >
          {leg.stopsLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Depart
          </p>
          <p className="mt-1 text-sm text-white">{leg.departLabel}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Arrive
          </p>
          <p className="mt-1 text-sm text-white">{leg.arrivalLabel}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
            Duration
          </p>
          <p className="mt-1 text-sm text-white">{leg.durationLabel}</p>
        </div>
      </div>
    </div>
  );
}

function FareRow({
  entry,
}: {
  entry: NormalizedFareEntryVM;
}) {
  const isReturn = entry.tripType === "return" && entry.returnLeg;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {entry.logoUrl && (
              <img
                src={entry.logoUrl}
                alt={entry.airline}
                className="h-6 w-6 rounded-sm bg-white/10 object-contain"
              />
            )}
            <h3 className="text-base font-semibold text-white">
              {entry.airline}
            </h3>

            {entry.airlineCode ? (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60">
                {entry.airlineCode}
              </span>
            ) : null}

            <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[11px] text-fuchsia-200">
              {entry.tripType === "return" ? "Return fare" : "One-way fare"}
            </span>
          </div>

          <p className="mt-2 text-sm text-white/60">
            {entry.from1} → {entry.to1}
            {isReturn ? ` · ${entry.from2} → ${entry.to2}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Price
            </p>
            <p className="text-lg font-semibold text-amber-200">
              {entry.priceLabel}
            </p>
          </div>

          <a
            href={entry.bookingUrl}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Book now
          </a>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FareLegCard title="Outbound" leg={entry.outbound} />

        {isReturn && entry.returnLeg ? (
          <FareLegCard title="Return" leg={entry.returnLeg} />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#100b21] p-4">
            <p className="text-sm font-medium text-white">No return leg</p>
            <p className="mt-1 text-sm text-white/55">
              This fare is currently shown as one-way only.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default function FareFinder({ data }: FareFinderProps) {
  const { fareFinder, route } = data;

  const originValues = useMemo(
    () => fareFinder.originOptions.map((option) => option.value),
    [fareFinder.originOptions],
  );

  const [selectedOrigin, setSelectedOrigin] = useState(fareFinder.defaultOrigin);
  const [maxBudget, setMaxBudget] = useState(fareFinder.summary.defaultBudget);

  useEffect(() => {
    setSelectedOrigin(fareFinder.defaultOrigin);
  }, [fareFinder.defaultOrigin]);

  useEffect(() => {
    setMaxBudget(fareFinder.summary.defaultBudget);
  }, [fareFinder.summary.defaultBudget]);

  const filteredEntries = useMemo(() => {
    return fareFinder.entries.filter((entry) => {
      const originMatch =
        !selectedOrigin ||
        entry.from1 === selectedOrigin ||
        entry.from2 === selectedOrigin;

      const budgetMatch =
        maxBudget <= 0 ? true : entry.price <= maxBudget;

      return originMatch && budgetMatch;
    });
  }, [fareFinder.entries, selectedOrigin, maxBudget]);

  const filteredCheapest =
    filteredEntries.length > 0
      ? Math.min(...filteredEntries.map((entry) => entry.price))
      : null;

  const filteredCheapestLabel =
    filteredCheapest != null ? formatBudget(filteredCheapest) : "—";

  const hasBudgetRange =
    fareFinder.summary.budgetMax > 0 &&
    fareFinder.summary.budgetMax > fareFinder.summary.budgetMin;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            Fare finder
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {fareFinder.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {fareFinder.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Cheapest fare
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {fareFinder.summary.cheapestFareLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Available entries
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {fareFinder.summary.entryCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        {/* ── Filters: origin + budget ── */}
        <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{route.routeLabel}</p>
            <p className="mt-1 text-xs text-white/55">
              Filter fare combinations by origin airport and budget.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {fareFinder.originOptions.map((option) => {
                const active = selectedOrigin === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedOrigin(option.value)}
                    className={[
                      "inline-flex items-center rounded-full border px-4 py-2 text-sm transition",
                      active
                        ? "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-100"
                        : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget slider */}
          {hasBudgetRange && (
            <div className="w-full rounded-2xl border border-white/10 bg-[#100b21] p-4 lg:w-80">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                    Max budget
                  </p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">
                    {formatBudget(maxBudget)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-white/40">
                  <p>Range</p>
                  <p className="mt-1">
                    {formatBudget(fareFinder.summary.budgetMin)} –{" "}
                    {formatBudget(fareFinder.summary.budgetMax)}
                  </p>
                </div>
              </div>

              <Slider
                value={[maxBudget]}
                min={fareFinder.summary.budgetMin}
                max={fareFinder.summary.budgetMax}
                step={fareFinder.summary.budgetStep}
                onValueChange={(v) =>
                  setMaxBudget(v[0] ?? fareFinder.summary.defaultBudget)
                }
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                <span>
                  Cheapest: {filteredCheapestLabel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMaxBudget(fareFinder.summary.defaultBudget)
                  }
                  className="rounded-full border border-white/10 px-2.5 py-1 text-white/60 transition hover:bg-white/[0.06]"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {filteredEntries.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {filteredEntries.map((entry) => (
              <FareRow
                key={String(entry.id)}
                entry={entry}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-[#100b21] p-6 text-center">
            <p className="text-sm font-medium text-white">
              No fares found for this combination.
            </p>
            <p className="mt-2 text-sm text-white/60">
              Increase the budget cap or try another origin filter to see more
              combinations.
            </p>
          </div>
        )}

        {originValues.length > 1 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#100b21] px-4 py-3">
            <p className="text-xs text-white/55">
              Available origins: {originValues.join(", ")} ·{" "}
              {filteredEntries.length} result
              {filteredEntries.length === 1 ? "" : "s"} shown
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
