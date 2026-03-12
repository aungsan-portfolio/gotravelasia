// client/src/components/flights/destination/AirlineReviews.tsx

import { useEffect, useMemo, useState } from "react";
import type { DestinationPageVM } from "@/types/destination";

type AirlineReviewsProps = {
  data: DestinationPageVM;
};

function scoreTone(score: number): string {
  if (score >= 8) return "from-emerald-400 to-emerald-300";
  if (score >= 7) return "from-amber-400 to-amber-300";
  return "from-rose-400 to-rose-300";
}

function scoreTextTone(score: number): string {
  if (score >= 8) return "text-emerald-200";
  if (score >= 7) return "text-amber-200";
  return "text-rose-200";
}

export default function AirlineReviews({ data }: AirlineReviewsProps) {
  const { reviews, route } = data;

  const [selectedAirlineCode, setSelectedAirlineCode] = useState<string | null>(
    reviews.defaultAirlineCode
  );

  useEffect(() => {
    setSelectedAirlineCode(reviews.defaultAirlineCode);
  }, [reviews.defaultAirlineCode]);

  const selectedReview = useMemo(() => {
    return (
      reviews.items.find((item) => item.airlineCode === selectedAirlineCode) ??
      reviews.items[0] ??
      null
    );
  }, [reviews.items, selectedAirlineCode]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {reviews.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {reviews.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Top airline
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {reviews.summary.topAirline}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Best score
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {reviews.summary.topScore ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Average score
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {reviews.summary.avgScore}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Airlines</p>
              <p className="mt-1 text-xs text-white/55">
                Select a carrier to view highlights
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#100b21] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                Route
              </p>
              <p className="text-sm font-medium text-white">{route.routeLabel}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {reviews.items.map((item) => {
              const active = item.airlineCode === selectedReview?.airlineCode;

              return (
                <button
                  key={item.airlineCode}
                  type="button"
                  onClick={() => setSelectedAirlineCode(item.airlineCode ?? null)}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-fuchsia-400/30 bg-fuchsia-400/10"
                      : "border-white/10 bg-[#100b21] hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.logoUrl && (
                          <img
                            src={item.logoUrl}
                            alt={item.airline}
                            className="h-5 w-5 rounded object-contain bg-white/10"
                          />
                        )}
                        <span className="truncate text-sm font-semibold text-white">
                          {item.airline}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60">
                          {item.airlineCode}
                        </span>
                      </div>
                    </div>

                    <div className={`text-sm font-semibold ${scoreTextTone(item.score)}`}>
                      {item.score}
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${scoreTone(item.score)}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score * 10))}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          {selectedReview ? (
            <>
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {selectedReview.airline}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60">
                      {selectedReview.airlineCode}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-white/60">
                    Review summary for flights to {route.destination.city}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#100b21] px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                    Score
                  </p>
                  <p className={`text-2xl font-semibold ${scoreTextTone(selectedReview.score)}`}>
                    {selectedReview.score}/10
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {selectedReview.highlights.map((highlight, index) => (
                  <div
                    key={`${selectedReview.airlineCode}-${index}`}
                    className="rounded-2xl border border-white/10 bg-[#100b21] p-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.12em] text-fuchsia-200/70">
                      Highlight {index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#100b21] p-6 text-center">
              <p className="text-sm font-medium text-white">No review data available.</p>
              <p className="mt-2 text-sm text-white/60">
                Airline review content will appear here when data is available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
