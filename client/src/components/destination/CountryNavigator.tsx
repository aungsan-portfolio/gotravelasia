// client/src/components/destination/CountryNavigator.tsx
// ─────────────────────────────────────────────────────────────────────
// A premium "city explorer" grid shown ONLY on country-level pages.
// Displays major cities within a country with cheapest-fare pills
// and deep links to dedicated city landing pages.
// ─────────────────────────────────────────────────────────────────────

import type { CountryCityVM } from "@/types/destination";

interface CountryNavigatorProps {
  countryName: string;
  cities: CountryCityVM[];
}

export default function CountryNavigator({ countryName, cities }: CountryNavigatorProps) {
  if (!cities.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
          Explore {countryName}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Popular cities in {countryName}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
          Compare flight deals to top destinations across {countryName}. Click a
          city to see detailed fares, airlines and travel insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <a
            key={city.code}
            href={city.href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
          >
            {/* Header with city name and code badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-fuchsia-100 transition-colors">
                  {city.name}
                </h3>
                <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/50">
                  {city.code}
                </span>
              </div>

              {/* Price pill */}
              {city.startingFrom ? (
                <div className="shrink-0 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/70">
                    From
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-amber-300">
                    {city.startingFrom}
                  </p>
                </div>
              ) : (
                <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
                    Price
                  </p>
                  <p className="mt-0.5 text-sm text-white/50">
                    Check deals
                  </p>
                </div>
              )}
            </div>

            {/* CTA arrow */}
            <div className="mt-4 flex items-center gap-2 text-sm text-white/50 transition-colors group-hover:text-fuchsia-200">
              <span>View flights</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Decorative gradient bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </section>
  );
}
