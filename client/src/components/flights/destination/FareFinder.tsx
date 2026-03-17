// client/src/components/flights/destination/FareFinder.tsx

import { useMemo, useState } from "react";
import type {
  DestinationPageVM,
  NormalizedFareEntryVM,
} from "@/types/destination";

type FareFinderProps = {
  data: DestinationPageVM;
  entriesOverride?: NormalizedFareEntryVM[];
};

interface FareLegVM {
  route: string;
  departLabel: string;
  arrivalLabel: string;
  stopsLabel: string;
  durationLabel: string;
  stopBadgeTone: "green" | "amber" | "red";
}

const STOP_BADGE_STYLES: Record<FareLegVM["stopBadgeTone"], string> = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};



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

function FareRow({ entry }: { entry: NormalizedFareEntryVM }) {
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
            {entry.from1} \u2192 {entry.to1}
            {isReturn ? ` \u00b7 ${entry.from2} \u2192 ${entry.to2}` : ""}
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

export default function FareFinder({ data, entriesOverride }: FareFinderProps) {
  const { fareFinder } = data;
  const filteredEntries = useMemo(
    () => entriesOverride ?? fareFinder.entries,
    [entriesOverride, fareFinder.entries]
  );

  // ── Pagination ───────────────────────────────────────────────
  const PAGE_SIZE = 7;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(filteredEntries.length / PAGE_SIZE);
  const pagedEntries = useMemo(
    () =>
      filteredEntries.slice(
        (page - 1) * PAGE_SIZE,
        (page - 1) * PAGE_SIZE + PAGE_SIZE
      ),
    [filteredEntries, page]
  );

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

      <div className="mt-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          {/* Showing X–Y of Z label */}
          {filteredEntries.length > 0 && (
            <p className="mb-3 text-sm text-white/40">
              Showing{" "}
              <span className="font-medium text-white/70">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredEntries.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white/70">
                {filteredEntries.length}
              </span>{" "}
              fares
            </p>
          )}

          {pagedEntries.length > 0 ? (
            <div className="flex flex-col gap-4">
              {pagedEntries.map((entry) => (
                <FareRow key={String(entry.id)} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">✈️</span>
              <p className="text-white/50">No fares match your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
              >
                \u2190 Prev
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx + 1)}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition",
                      idx + 1 === page ? "bg-amber-400" : "bg-white/20 hover:bg-white/40",
                    ].join(" ")}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next \u2192
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
