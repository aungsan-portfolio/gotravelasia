// client/src/components/flights/destination/HeroSearch.tsx
import { useState } from "react";
import { Link } from "wouter";
import { Plane, Calendar, Users, ArrowRight } from "lucide-react";
import type { DestinationPageVM } from "@/types/destination";

type HeroSearchProps = { data: DestinationPageVM };

const STATUS_STYLES: Record<
  DestinationPageVM["status"]["tone"],
  { wrap: string; dot: string; text: string }
> = {
  green: { wrap:"border-emerald-400/25 bg-emerald-400/10", dot:"bg-emerald-400", text:"text-emerald-100" },
  amber: { wrap:"border-amber-400/25  bg-amber-400/10",   dot:"bg-amber-400",   text:"text-amber-100"  },
  red:   { wrap:"border-rose-400/25   bg-rose-400/10",    dot:"bg-rose-400",    text:"text-rose-100"   },
};

export default function HeroSearch({ data }: HeroSearchProps) {
  const { hero, status } = data;
  const { searchForm }   = hero;
  const tone             = STATUS_STYLES[status.tone];

  const [tripType,   setTripType]   = useState<"return" | "oneway">(searchForm.defaultTripType);
  const [departDate, setDepartDate] = useState(searchForm.defaultDepartDate);
  const [returnDate, setReturnDate] = useState(searchForm.defaultReturnDate ?? "");
  const [passengers, setPassengers] = useState(searchForm.defaultPassengers);

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      origin:      searchForm.originCode,
      destination: searchForm.destinationCode,
      depart:      departDate,
      passengers:  String(passengers),
      type:        tripType,
    });
    if (tripType === "return" && returnDate) params.set("return", returnDate);
    window.location.href = `${searchForm.bookingSearchUrl}?${params}`;
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 pb-10 pt-8">

      {/* Status badge */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone.wrap} ${tone.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {status.label}
        </span>
        {status.sourceLabel && (
          <span className="text-xs text-white/40">· {status.sourceLabel}</span>
        )}
        {status.lastUpdatedLabel && (
          <span className="text-xs text-white/40">· Updated {status.lastUpdatedLabel}</span>
        )}
      </div>

      {/* Route label + heading */}
      <p className="mb-1 text-xs font-mono tracking-widest text-white/30 uppercase">
        {searchForm.originCode} → {searchForm.destinationCode}
      </p>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
        {hero.title}
      </h1>
      {hero.subtitle && (
        <p className="mb-6 max-w-xl text-sm text-slate-400">{hero.subtitle}</p>
      )}

      {/* ── Search form card ── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm space-y-4 max-w-2xl"
      >
        {/* Trip type toggle */}
        <div className="flex gap-2">
          {(["return", "oneway"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={[
                "rounded-full border px-4 py-1 text-sm font-semibold transition-all",
                tripType === type
                  ? "border-amber-400 bg-amber-400 text-slate-900"
                  : "border-white/15 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {type === "return" ? "Return" : "One-way"}
            </button>
          ))}
        </div>

        {/* Origin / Destination (read-only route) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <Plane className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-white/40">From</p>
              <p className="truncate text-sm font-semibold text-white">{searchForm.originLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <Plane className="h-4 w-4 shrink-0 rotate-90 text-amber-400" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-white/40">To</p>
              <p className="truncate text-sm font-semibold text-white">{searchForm.destinationLabel}</p>
            </div>
          </div>
        </div>

        {/* Dates + Passengers */}
        <div className="grid grid-cols-3 gap-3">

          {/* Depart */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-white/40">Depart</p>
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

          {/* Return */}
          <div className={[
            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-opacity",
            tripType === "return"
              ? "border-white/10 bg-white/[0.04]"
              : "pointer-events-none border-white/5 bg-white/[0.02] opacity-40",
          ].join(" ")}>
            <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-white/40">Return</p>
              <input
                type="date"
                value={returnDate}
                min={departDate || today}
                disabled={tripType !== "return"}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <Users className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wide text-white/40">Passengers</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xs leading-none"
                  aria-label="Decrease passengers"
                >−</button>
                <span className="min-w-[1.25rem] text-center text-sm font-semibold text-white">
                  {passengers}
                </span>
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xs leading-none"
                  aria-label="Increase passengers"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-base font-bold text-slate-900 transition hover:bg-amber-300 active:scale-[0.98]"
        >
          Search flights
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* ── Secondary summary chips ── */}
      <div className="mt-5 flex flex-wrap gap-3 max-w-2xl">
        {hero.summaryChips.map((chip) => (
          <div
            key={chip.label}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wide text-white/40">{chip.label}</p>
            <p className="text-sm font-semibold text-white">{chip.value}</p>
            <p className="text-xs text-amber-400">{chip.subValue}</p>
          </div>
        ))}
        <Link
          href={data.route.bookingCtaHref}
          className="self-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/50 transition hover:bg-white/[0.08] hover:text-white"
        >
          View route page →
        </Link>
      </div>
    </section>
  );
}
