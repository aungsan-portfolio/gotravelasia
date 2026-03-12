// client/src/components/flights/destination/HeroSearch.tsx

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Plane, Calendar, Users, ArrowRight } from "lucide-react";
import type { DestinationPageVM } from "@/types/destination";

type HeroSearchProps = {
  data: DestinationPageVM;
};

const STATUS_STYLES: Record<
  DestinationPageVM["status"]["tone"],
  { wrap: string; dot: string; text: string }
> = {
  green: {
    wrap: "border-emerald-400/25 bg-emerald-400/10",
    dot: "bg-emerald-400",
    text: "text-emerald-100",
  },
  amber: {
    wrap: "border-amber-400/25 bg-amber-400/10",
    dot: "bg-amber-400",
    text: "text-amber-100",
  },
  red: {
    wrap: "border-rose-400/25 bg-rose-400/10",
    dot: "bg-rose-400",
    text: "text-rose-100",
  },
};

function getOriginLabel(
  code: string,
  options: Array<{ value: string; label: string }>,
  fallbackLabel: string
): string {
  return options.find((option) => option.value === code)?.label ?? fallbackLabel;
}

export default function HeroSearch({ data }: HeroSearchProps) {
  const { hero, status, fareFinder } = data;
  const { searchForm } = hero;
  const tone = STATUS_STYLES[status.tone];

  const originOptions = useMemo(() => {
    const seen = new Set<string>();
    const merged = [
      { value: searchForm.originCode, label: searchForm.originLabel },
      ...fareFinder.originOptions,
    ];

    return merged.filter((option) => {
      const key = option.value.trim().toUpperCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [fareFinder.originOptions, searchForm.originCode, searchForm.originLabel]);

  const [tripType, setTripType] = useState<"return" | "oneway">(
    searchForm.defaultTripType
  );
  const [originCode, setOriginCode] = useState(searchForm.originCode);
  const [departDate, setDepartDate] = useState(searchForm.defaultDepartDate);
  const [returnDate, setReturnDate] = useState(searchForm.defaultReturnDate ?? "");
  const [passengers, setPassengers] = useState(searchForm.defaultPassengers);

  const today = new Date().toISOString().split("T")[0];
  const selectedOriginLabel = getOriginLabel(
    originCode,
    originOptions,
    searchForm.originLabel
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams({
      origin: originCode,
      destination: searchForm.destinationCode,
      depart: departDate,
      passengers: String(passengers),
      type: tripType,
    });

    if (tripType === "return" && returnDate) {
      params.set("return", returnDate);
    }

    window.location.href = `${searchForm.bookingSearchUrl}?${params.toString()}`;
  }

  return (
    <section className="relative overflow-hidden bg-[#0b0719] px-4 pb-12 pt-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.25),_transparent_35%),linear-gradient(180deg,rgba(11,7,25,1),rgba(15,23,42,1))]" />

      <div className="relative mx-auto max-w-7xl">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            tone.wrap,
            tone.text,
          ].join(" ")}
        >
          <span className={["h-2 w-2 rounded-full", tone.dot].join(" ")} />
          <span>{status.label}</span>
          {status.sourceLabel ? <span>· {status.sourceLabel}</span> : null}
          {status.lastUpdatedLabel ? <span>· Updated {status.lastUpdatedLabel}</span> : null}
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">
              {selectedOriginLabel} to {searchForm.destinationLabel}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {hero.title}
            </h1>

            {hero.subtitle ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {hero.subtitle}
              </p>
            ) : null}
          </div>

          <Link
            href={data.route.bookingCtaHref}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-fuchsia-500/20"
          >
            {data.route.bookingCtaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-5"
        >
          <div className="flex flex-wrap gap-2">
            {(["return", "oneway"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
                  tripType === type
                    ? "border-amber-400 bg-amber-400 text-slate-900"
                    : "border-white/15 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]",
                ].join(" ")}
              >
                {type === "return" ? "Return" : "One-way"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1.1fr_1fr_1fr_0.9fr_auto]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                <Plane className="h-4 w-4" />
                From
              </div>

              <div className="mt-3">
                <select
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white outline-none"
                  aria-label="Select origin airport"
                >
                  {originOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                <Plane className="h-4 w-4" />
                To
              </div>

              <div className="mt-3 text-sm font-medium text-white">
                {searchForm.destinationLabel}
              </div>
              <div className="mt-1 text-xs text-white/45">{searchForm.destinationCode}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                <Calendar className="h-4 w-4" />
                Depart
              </div>

              <div className="mt-3">
                <input
                  type="date"
                  value={departDate}
                  min={today}
                  onChange={(e) => {
                    setDepartDate(e.target.value);
                    if (returnDate && e.target.value > returnDate) setReturnDate("");
                  }}
                  className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                <Calendar className="h-4 w-4" />
                Return
              </div>

              <div className="mt-3">
                <input
                  type="date"
                  value={returnDate}
                  min={departDate || today}
                  disabled={tripType !== "return"}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark] disabled:opacity-40"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                <Users className="h-4 w-4" />
                Passengers
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Decrease passengers"
                >
                  −
                </button>

                <span className="text-sm font-semibold text-white">{passengers}</span>

                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Increase passengers"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[88px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Search flights
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {hero.summaryChips.map((chip) => (
            <div
              key={chip.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">{chip.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{chip.value}</p>
              <p className="mt-1 text-sm text-slate-300">{chip.subValue}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
