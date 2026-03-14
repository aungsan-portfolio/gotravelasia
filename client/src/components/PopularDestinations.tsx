import { useMemo } from "react";
import { getPopularCountries, getPopularCities } from "@/components/FloatingSearchBar/airports";
import { useGeoOrigin } from "@/hooks/useGeoOrigin";

// Utility to split array into N columns
function toColumns<T>(arr: T[], cols = 3): T[][] {
  const perCol = Math.ceil(arr.length / cols);
  return Array.from({ length: cols }, (_, i) =>
    arr.slice(i * perCol, (i + 1) * perCol)
  );
}

// Hardcoded images for featured destinations (can be moved to data later)
const FEATURED_IMAGES: Record<string, string> = {
  Bangkok: "/images/bangkok.webp",
  Singapore: "/images/singapore.webp",
  Tokyo: "/images/tokyo.webp",
  Bali: "/images/bali.webp",
  Phuket: "/images/phuket.webp",
};

export default function PopularDestinations() {
  const origin = useGeoOrigin();

  // Load popular data
  const countries = useMemo(() => getPopularCountries(), []);
  const cities    = useMemo(() => getPopularCities(),    []);

  // Personalization: Push user's country/city to the top
  const sortedCountries = useMemo(() =>
    [...countries].sort(a => a.country === origin.country ? -1 : 0),
    [countries, origin.country]
  );

  const sortedCities = useMemo(() =>
    [...cities].sort(a => a.country === origin.country ? -1 : 0),
    [cities, origin.country]
  );

  // Take first 4 for the "Featured Cards" row
  const featured = sortedCities.slice(0, 4);
  
  // The rest go into the 3-column exhaustive list
  const listCities = sortedCities.slice(4);
  const countryColumns = toColumns(sortedCountries);
  const cityColumns = toColumns(listCities);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12">
      {/* ── Featured Row (Cards) ── */}
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-3">
        Featured Destinations
        <span className="h-px bg-white/10 flex-1"></span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {featured.map(f => (
          <a 
            key={f.code} 
            href={f.href}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
          >
            <img 
              src={FEATURED_IMAGES[f.city] || "/images/destination-placeholder.webp"} 
              alt={f.city}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1 block opacity-80 decoration-none">{f.country}</span>
              <h3 className="text-lg font-bold text-white decoration-none">{f.city}</h3>
              <div className="mt-2 text-[11px] font-semibold text-white/70 group-hover:text-white flex items-center gap-1 transition-colors">
                View deals <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ── Exhaustive List (3-Column Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Countries Column */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
            Popular Countries
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {sortedCountries.map(d => (
              <a
                key={d.country}
                href={d.href}
                className="text-[13px] text-purple-200/70 hover:text-white transition-colors duration-200 flex items-center justify-between group"
              >
                <span>{d.label}</span>
                <span className="h-px bg-white/5 flex-1 mx-2 group-hover:bg-purple-500/30 transition-colors"></span>
              </a>
            ))}
          </div>
        </div>

        {/* More Cities Column */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
            More Cities
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {listCities.map(c => (
              <a
                key={c.code}
                href={c.href}
                className="text-[13px] text-purple-200/70 hover:text-white transition-colors duration-200 flex items-center justify-between group"
              >
                <span>{c.label}</span>
                <span className="h-px bg-white/5 flex-1 mx-2 group-hover:bg-purple-500/30 transition-colors"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
