import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import HotelCard from '@/components/HotelCard';
import type { AffiliateLinks, HotelData } from '@/components/HotelCard';
import { CITIES_BY_COUNTRY, type City } from '@shared/hotels/cities';
import { buildHotelSearchParams, defaultHotelDates, parseHotelSearchParams } from '@shared/hotels/searchParams';
import { HOTEL_SORTS, type HotelSearchMeta, type HotelSearchResponse, type HotelSort } from '@shared/hotels/types';

const SORT_OPTIONS: { value: HotelSort; label: string }[] = [
  { value: 'rank', label: 'Recommended' },
  { value: 'review_desc', label: 'Review score' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'stars_desc', label: 'Star rating' },
];

function clientSort(hotels: HotelData[], sort: HotelSort) {
  return [...hotels].sort((a, b) => {
    if (sort === 'review_desc') return (b.reviewScore ?? 0) - (a.reviewScore ?? 0);
    if (sort === 'price_asc') return (a.lowestRate ?? Number.MAX_SAFE_INTEGER) - (b.lowestRate ?? Number.MAX_SAFE_INTEGER);
    if (sort === 'price_desc') return (b.lowestRate ?? 0) - (a.lowestRate ?? 0);
    if (sort === 'stars_desc') return (b.stars ?? 0) - (a.stars ?? 0);
    return 0;
  });
}

export default function HotelsPage() {
  const searchStr = useSearch();
  const [, navigate] = useLocation();
  const defaults = useMemo(() => defaultHotelDates(), []);
  const parsed = useMemo(() => parseHotelSearchParams(searchStr ?? ''), [searchStr]);

  const [citySlug, setCitySlug] = useState(parsed.city);
  const [checkIn, setCheckIn] = useState(parsed.checkIn);
  const [checkOut, setCheckOut] = useState(parsed.checkOut);
  const [adults, setAdults] = useState(parsed.adults);
  const [rooms, setRooms] = useState(parsed.rooms);
  const [page, setPage] = useState(parsed.page);
  const [sortBy, setSortBy] = useState<HotelSort>(parsed.sort);

  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [aff, setAff] = useState<AffiliateLinks | null>(null);
  const [cityMeta, setCityMeta] = useState<City | null>(null);
  const [meta, setMeta] = useState<HotelSearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [minStars, setMinStars] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCitySlug(parsed.city);
    setCheckIn(parsed.checkIn);
    setCheckOut(parsed.checkOut);
    setAdults(parsed.adults);
    setRooms(parsed.rooms);
    setPage(parsed.page);
    setSortBy(parsed.sort);
  }, [parsed]);

  useEffect(() => {
    if (!searchStr) return;
    void handleSearch(parsed, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.city, parsed.checkIn, parsed.checkOut, parsed.adults, parsed.rooms, parsed.page, parsed.sort]);

  async function handleSearch(next = { city: citySlug, checkIn, checkOut, adults, rooms, page, sort: sortBy }, pushUrl = true) {
    setLoading(true);
    setError('');
    const params = buildHotelSearchParams(next);

    if (pushUrl) {
      navigate(`/hotels?${params.toString()}`, { replace: false });
    }

    try {
      const res = await fetch(`/api/hotels/search?${params.toString()}`);
      const data = await res.json() as HotelSearchResponse | { error?: string };
      if (!res.ok) throw new Error('error' in data ? data.error ?? 'Search failed' : 'Search failed');

      const response = data as HotelSearchResponse;
      setHotels(response.hotels ?? []);
      setAff(response.affiliateLinks ?? null);
      setCityMeta(response.city ?? null);
      setMeta(response.meta ?? null);
      setSearched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = useMemo(
    () => clientSort(hotels.filter((hotel) => (hotel.stars ?? 0) >= minStars), sortBy),
    [hotels, minStars, sortBy],
  );

  const currentPage = meta?.page ?? page;
  const hasNextPage = meta?.hasNextPage ?? false;
  const providerWarnings = meta?.warnings ?? [];
  const sourceLabel = meta?.source === 'mock' ? 'Demo fallback results' : 'Live Agoda results';

  const updateSearchState = (updates: Partial<{ city: string; checkIn: string; checkOut: string; adults: number; rooms: number; page: number; sort: HotelSort }>) => {
    const next = { city: citySlug, checkIn, checkOut, adults, rooms, page, sort: sortBy, ...updates };
    setCitySlug(next.city);
    setCheckIn(next.checkIn);
    setCheckOut(next.checkOut);
    setAdults(next.adults);
    setRooms(next.rooms);
    setPage(next.page);
    setSortBy(next.sort);
    void handleSearch(next);
  };

  return (
    <div className="min-h-screen">
      <section className="relative bg-navy py-14 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 15% 65%,rgba(124,92,191,.16) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 88% 25%,rgba(245,200,66,.06) 0%,transparent 70%)' }} />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-gold text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full mb-5 border border-gold/25 bg-gold/10">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            43 CITIES · HOTELS ACROSS ASIA
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-white mb-3">
            Find your perfect hotel<br />
            <span className="text-gold">at the lowest price</span>
          </h1>
          <p className="text-white/65 text-base mb-8">Compare Agoda, Booking.com, Trip.com, Expedia &amp; Klook</p>

          <form onSubmit={(e) => { e.preventDefault(); updateSearchState({ page: 1 }); }} className="glass-card rounded-3xl p-5 max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex flex-col gap-1 flex-[2] min-w-[180px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Destination
                </label>
                <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)} className="field-dark">
                  {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
                    <optgroup key={country} label={`${data.flag} ${country}`}>
                      {data.cities.filter((city) => city.hasHotels).map((city) => <option key={city.slug} value={city.slug}>{city.flag} {city.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Check-in</label>
                <input type="date" className="field-dark" value={checkIn} min={defaults.checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Check-out</label>
                <input type="date" className="field-dark" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Adults</label>
                <select className="field-dark" value={adults} onChange={(e) => setAdults(Number.parseInt(e.target.value, 10))}>{[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </div>

              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Rooms</label>
                <select className="field-dark" value={rooms} onChange={(e) => setRooms(Number.parseInt(e.target.value, 10))}>{[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </div>

              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand-hover disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap self-end">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching…</> : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search Hotels</>}
              </button>
            </div>
          </form>
        </div>
      </section>

      {(searched || loading) && (
        <section className="max-w-6xl mx-auto px-6 py-8" ref={resultsRef}>
          {error && <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-sm border border-red-400/20 bg-red-400/8">{error}</div>}

          {!error && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-white/65 text-sm flex items-center gap-2">
                  {cityMeta && <span className="text-xl">{cityMeta.flag}</span>}
                  {loading ? 'Searching…' : <><span className="text-2xl font-extrabold font-display text-white">{displayed.length}</span> hotels{cityMeta && <> in <strong>{cityMeta.name}</strong></>}</>}
                </span>
                {!loading && (
                  <div className="flex gap-1.5">
                    {[0,3,4,5].map((stars) => (
                      <button key={stars} onClick={() => setMinStars(stars)} className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${minStars === stars ? 'bg-gold/12 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/65 hover:border-gold/30'}`}>
                        {stars === 0 ? 'All' : `${'★'.repeat(stars)}+`}
                      </button>
                    ))}
                  </div>
                )}
                {meta && <span className="text-[11px] rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">{sourceLabel}</span>}
              </div>

              {!loading && (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-white/38">Sort:</span>
                  <select value={sortBy} onChange={(e) => updateSearchState({ sort: e.target.value as HotelSort, page: 1 })} className="bg-white/5 border border-white/10 text-white/65 text-sm px-3 py-1.5 rounded-lg outline-none">
                    {SORT_OPTIONS.filter((option) => HOTEL_SORTS.includes(option.value)).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {!loading && providerWarnings.length > 0 && (
            <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
              {providerWarnings.join(' ')}
            </div>
          )}

          {!loading && aff && (
            <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-2.5 rounded-xl border border-white/7 bg-white/[0.03]">
              <span className="text-[11px] text-white/38">Also search on:</span>
              {([['Agoda','#E22128',aff.agoda],['Booking.com','#4A90E2',aff.booking],['Trip.com','#1890FF',aff.trip],['Klook','#FF5C35',aff.klook],['Expedia','#00355F',aff.expedia]] as [string,string,string|undefined][])
                .filter(([, , url]) => url)
                .map(([name, color, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center gap-1.5 text-[12px] font-medium text-white/65 bg-white/5 border border-white/10 px-3 py-1 rounded-full hover:text-white hover:bg-white/8 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    {name}
                  </a>
              ))}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-navy-card border border-white/8 rounded-2xl overflow-hidden">
                  <div className="h-[175px] animate-shimmer" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="h-3 rounded animate-shimmer w-3/4" />
                    <div className="h-3 rounded animate-shimmer w-1/2" />
                    <div className="h-3 rounded animate-shimmer w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && displayed.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayed.map((hotel, i) => (
                  <HotelCard key={hotel.hotelId} hotel={hotel} city={cityMeta ?? undefined} affiliateLinks={aff ?? {}} checkIn={checkIn} checkOut={checkOut} adults={adults} animDelay={i * 50} />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-sm text-white/55">Page {currentPage}{meta?.pageSize ? ` · ${meta.pageSize} per page` : ''}</div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={currentPage <= 1 || loading} onClick={() => updateSearchState({ page: Math.max(1, currentPage - 1) })} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-40">Previous</button>
                  <button type="button" disabled={!hasNextPage || loading} onClick={() => updateSearchState({ page: currentPage + 1 })} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}

          {!loading && searched && displayed.length === 0 && !error && (
            <div className="text-center py-16 text-white/65">
              <div className="text-5xl mb-4">🔍</div>
              <p>No hotels found. Try different dates or filters.</p>
              {aff?.agoda && <a href={aff.agoda} target="_blank" rel="noreferrer sponsored" className="inline-block mt-5 bg-gold text-navy font-bold text-sm px-6 py-2.5 rounded-xl">Search on Agoda →</a>}
            </div>
          )}
        </section>
      )}

      {!searched && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="font-display text-xl font-bold text-white mb-6">Browse by destination</h2>
          {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
            <div key={country} className="mb-7">
              <h3 className="text-sm font-semibold text-white/45 mb-3">{data.flag} {country}</h3>
              <div className="flex flex-wrap gap-2">
                {data.cities.filter((city) => city.hasHotels).map((city) => (
                  <button key={city.slug} onClick={() => { setCitySlug(city.slug); window.scrollTo({ top:0, behavior:'smooth' }); }} className={`text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${citySlug === city.slug ? 'bg-gold/12 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/65 hover:border-gold/35 hover:text-white hover:bg-gold/6'}`}>
                    {city.flag} {city.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="max-w-6xl mx-auto px-6 pb-10 flex flex-wrap gap-2 border-t border-white/5 pt-6">
        {[['Flights','/flights'],['Transport','/transport'],['Activities','/activities']].map(([label, href]) => (
          <Link key={label} href={href} className="text-xs text-gold/70 border border-gold/20 px-4 py-1.5 rounded-full hover:bg-gold/8 transition-all">Also see: {label} →</Link>
        ))}
      </div>
    </div>
  );
}
