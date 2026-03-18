// client/src/components/destination/DestinationLandingPage.tsx

import type {
  DestinationLandingApiResponse,
  PopularCountry,
  ScoredDestination,
} from "@/types/destination";

// ---------------------------------------------------------------------------
// Data-fetching hook — placeholder for real fetch (e.g., SWR / tRPC)
// ---------------------------------------------------------------------------

declare function useDestinationLandingData(slug: string): {
  data: DestinationLandingApiResponse | undefined;
  isLoading: boolean;
  error: Error | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cityHref(slug: string) {
  return `/flights/to/${slug}`;
}

function countryHref(topCity: string) {
  return `/flights/to/${topCity.toLowerCase().replace(/\s+/g, "-")}`;
}

/** Popularity bar width as a percentage string */
function scoreWidth(score: number) {
  return `${Math.round(score * 100)}%`;
}

// ---------------------------------------------------------------------------
// PopularDestinations section
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

              {/* Score bar */}
              <div
                className="mt-3 h-1.5 rounded bg-white/5"
                role="presentation"
                aria-hidden="true"
              >
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

// ---------------------------------------------------------------------------
// PopularCities section
// ---------------------------------------------------------------------------

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

              {/* Score bar */}
              <div
                className="mt-3 h-1.5 rounded bg-white/5"
                role="presentation"
                aria-hidden="true"
              >
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
// Loading skeleton
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
};

export function DestinationLandingPage({ slug }: Props) {
  const { data, isLoading, error } = useDestinationLandingData(slug);

  if (isLoading) return <DestinationLandingSkeleton />;

  if (error || !data) {
    return (
      <p className="py-20 text-center text-slate-400">
        Unable to load destination data. Please try again later.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <PopularDestinations items={data.popularDestinations} />
      <PopularCities items={data.popularCities} />
    </div>
  );
}
