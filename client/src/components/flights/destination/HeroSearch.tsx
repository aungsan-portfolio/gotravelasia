// client/src/components/flights/destination/HeroSearch.tsx

import { Link } from "wouter";
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

function formatChipSubValue(value?: string | null): string {
  return value?.trim() || "—";
}

export default function HeroSearch({ data }: HeroSearchProps) {
  const { hero, route, status, seo, deals, fareFinder } = data;
  const tone = STATUS_STYLES[status.tone];

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0b0719]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_38%),radial-gradient(circle_at_right,_rgba(236,72,153,0.14),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tone.wrap} ${tone.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              <span>{status.label}</span>
              {status.sourceLabel ? (
                <>
                  <span className="opacity-40">•</span>
                  <span>{status.sourceLabel}</span>
                </>
              ) : null}
              {status.lastUpdatedLabel ? (
                <>
                  <span className="opacity-40">•</span>
                  <span>Updated {status.lastUpdatedLabel}</span>
                </>
              ) : null}
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/80">
                {route.origin.code} → {route.destination.code}
              </p>

              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                {hero.subtitle}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/75">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                From {hero.originLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                To {hero.destinationLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {deals.summary.cheapestPriceLabel} lowest seen
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={route.bookingCtaHref}
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                {route.bookingCtaLabel}
              </a>

              <Link
                href={seo.canonicalPath}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                View route page
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-[#120d25]/90 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-fuchsia-200/70">
                    Route snapshot
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {route.routeLabel}
                  </h2>
                </div>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-right">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-amber-100/75">
                    Cheapest
                  </div>
                  <div className="text-lg font-semibold text-amber-200">
                    {deals.summary.cheapestPriceLabel}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {hero.summaryChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                      {chip.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {chip.value}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {formatChipSubValue(chip.subValue)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f0a1f] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                      Fare finder
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {fareFinder.summary.cheapestFareLabel} across {fareFinder.summary.entryCount} fares
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                    {fareFinder.defaultOrigin}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {fareFinder.originOptions.slice(0, 4).map((origin) => (
                    <span
                      key={origin.value}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65"
                    >
                      {origin.label}
                    </span>
                  ))}
                </div>
              </div>

              {data.footer.browseLinks.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.footer.browseLinks.slice(0, 3).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.08]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
