// =============================================================================
// GoTravelAsia — Destination Landing Page (wired to real hook)
// components/destination/DestinationLandingPage.tsx
// =============================================================================

import { useDestinationLandingData } from "@/hooks/useDestinationLandingData";
import type { PopularCountry, ScoredDestination } from "@/types/destination";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cityHref(slug: string) {
  return `/flights/to/${slug}`;
}

function countryHref(topCity: string) {
  return `/flights/to/${topCity.toLowerCase().replace(/\s+/g, "-")}`;
}

function scoreWidth(score: number) {
  return `${Math.round(score * 100)}%`;
}

// ---------------------------------------------------------------------------
// Sub-sections
// ---------------------------------------------------------------------------

function PopularDestinations({ items }: { items: PopularCountry[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="popular-destinations-heading">
      <h2 id="popular-destinations-heading" className="text-xl font-semibold">
        Popular Destinations
      </h2>
      <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <li key={item.country}>
            <a
              href={countryHref(item.topCity)}
              className="block rounded-2xl border border-white/10 p-4 transition-colors hover:border-cyan-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <span className="text-sm text-slate-400">
                {item.cityCount} {item.cityCount === 1 ? "city" : "cities"}
              </span>
              <p className="mt-1 text-lg font-semibold">{item.country}</p>
              <p className="mt-2 text-sm text-slate-400">Top city: {item.topCity}</p>
              <div className="mt-3 h-1.5 rounded bg-white/5" aria-hidden="true">
                <div
                  className="h-1.5 rounded bg-cyan-400"
                  style={{ width: scoreWidth(item.popularityScore) }}
                />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PopularCities({ items }: { items: ScoredDestination[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="popular-cities-heading">
      <h2 id="popular-cities-heading" className="text-xl font-semibold">
        Popular Cities
      </h2>
      <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.slug}>
            <a
              href={cityHref(item.slug)}
              className="block rounded-2xl border border-white/10 p-4 transition-colors hover:border-cyan-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <span className="text-sm text-slate-400" aria-label={`Rank ${index + 1}`}>
                #{index + 1}
              </span>
              <p className="mt-1 text-lg font-semibold">{item.city}</p>
              <p className="text-sm text-slate-400">{item.country}</p>
              <div className="mt-3 h-1.5 rounded bg-white/5" aria-hidden="true">
                <div
                  className="h-1.5 rounded bg-cyan-400"
                  style={{ width: scoreWidth(item.popularityScore) }}
                />
              </div>
              {item.minPrice != null && (
                <p className="mt-2 text-sm font-medium text-emerald-300">
                  From ${item.minPrice}
                </p>
              )}
              {item.directFlights && (
                <p className="mt-1 text-xs text-slate-400">Direct flights available</p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DestinationLandingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse" aria-busy="true" aria-label="Loading">
      {[0, 1].map((s) => (
        <section key={s}>
          <div className="h-7 w-48 rounded bg-white/10" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Props = {
  slug: string;
  /** ISO 3166-1 alpha-2 country code — from GeoIP or user preferences */
  userCountryCode?: string | null;
};

export function DestinationLandingPage({ slug, userCountryCode }: Props) {
  const {
    data,
    isInitialLoading,
    isRefetching,
    error,
    isNotFound,
    refresh,
  } = useDestinationLandingData(slug, { userCountryCode });

  if (isInitialLoading) return <DestinationLandingSkeleton />;

  if (isNotFound) {
    return (
      <p className="py-20 text-center text-slate-400">
        Destination not found.
      </p>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-slate-400">
          Unable to load destination data. Please try again.
        </p>
        <button
          onClick={refresh}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/60 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-10">
      {/* Subtle refetch indicator — doesn't replace content */}
      {isRefetching && (
        <div className="absolute right-0 top-0 text-xs text-slate-500 animate-pulse">
          Updating…
        </div>
      )}
      <PopularDestinations items={data.popularDestinations} />
      <PopularCities items={data.popularCities} />
    </div>
  );
}
