/**
 * client/src/pages/HotelsPage.tsx
 * Step 4 — Hotels Integration
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useSearch }             from 'wouter';
import HotelCard            from '@/components/HotelCard';
import type { HotelData, AffiliateLinks } from '@/components/HotelCard';
import { CITIES_BY_COUNTRY, HOTEL_CITIES_SORTED, type City } from '@/lib/cities';

const SORT_OPTIONS = [
  { v:'rank',  l:'Recommended' },
  { v:'score', l:'Review score' },
  { v:'price', l:'Lowest price' },
  { v:'stars', l:'Star rating'  },
] as const;
type SortKey = typeof SORT_OPTIONS[number]['v'];

const offsetDate = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];

export default function HotelsPage() {
  const searchStr = useSearch();
  const urlParams = new URLSearchParams(searchStr ?? '');

  const today  = new Date().toISOString().split('T')[0];
  const defIn  = offsetDate(1);
  const defOut = offsetDate(4);

  // form
  const [citySlug, setCitySlug] = useState(urlParams.get('city') ?? 'yangon');
  const [checkIn,  setCheckIn]  = useState(urlParams.get('checkIn') ?? defIn);
  const [checkOut, setCheckOut] = useState(urlParams.get('checkOut') ?? defOut);
  const [adults,   setAdults]   = useState(parseInt(urlParams.get('adults') || '2', 10));
  const [rooms,    setRooms]    = useState(parseInt(urlParams.get('rooms') || '1', 10));

  // results
  const [hotels,   setHotels]   = useState<HotelData[]>([]);
  const [aff,      setAff]      = useState<AffiliateLinks | null>(null);
  const [cityMeta, setCityMeta] = useState<City | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState('');

  // filter / sort
  const [minStars, setMinStars] = useState(0);
  const [sortBy,   setSortBy]   = useState<SortKey>('rank');

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlParams.has('city') && !searched && !loading) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams({ city: citySlug, checkIn, checkOut, adults: String(adults), rooms: String(rooms) });
      const res = await fetch(`/api/hotels/search?${p}`);
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Search failed');
      }
      const data = await res.json() as { hotels: HotelData[]; affiliateLinks: AffiliateLinks; city: City };
      setHotels(data.hotels ?? []);
      setAff(data.affiliateLinks ?? null);
      setCityMeta(data.city ?? null);
      setSearched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally { setLoading(false); }
  }

  const displayed = [...hotels]
    .filter(h => (h.stars ?? 0) >= minStars)
    .sort((a, b) => {
      if (sortBy === 'score') return (b.reviewScore ?? 0) - (a.reviewScore ?? 0);
      if (sortBy === 'price') return (a.lowestRate  ?? 999) - (b.lowestRate  ?? 999);
      if (sortBy === 'stars') return (b.stars       ?? 0) - (a.stars       ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen">
      {/* ── Hero / Search ──────────────────────────────── */}
      <section className="relative bg-navy py-14 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background:'radial-gradient(ellipse 60% 50% at 15% 65%,rgba(124,92,191,.16) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 88% 25%,rgba(245,200,66,.06) 0%,transparent 70%)'
        }} />
        <div className="relative max-w-6xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 text-gold text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full mb-5 border border-gold/25 bg-gold/10">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            43 CITIES · HOTELS ACROSS ASIA
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-white mb-3">
            Find your perfect hotel<br />
            <span className="text-gold">at the lowest price</span>
          </h1>
          <p className="text-white/65 text-base mb-8">
            Compare Agoda, Booking.com, Trip.com, Expedia &amp; Klook
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch}
            className="glass-card rounded-3xl p-5 max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 items-end">

              {/* Destination — grouped optgroup */}
              <div className="flex flex-col gap-1 flex-[2] min-w-[180px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>Destination
                </label>
                <select value={citySlug} onChange={e => setCitySlug(e.target.value)} className="field-dark">
                  {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
                    <optgroup key={country} label={`${data.flag} ${country}`}>
                      {data.cities.filter(c => c.hasHotels).map(c => (
                        <option key={c.slug} value={c.slug}>{c.flag} {c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Check-in */}
              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Check-in</label>
                <input type="date" className="field-dark" value={checkIn} min={today}
                  onChange={e => setCheckIn(e.target.value)} />
              </div>

              {/* Check-out */}
              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Check-out</label>
                <input type="date" className="field-dark" value={checkOut} min={checkIn}
                  onChange={e => setCheckOut(e.target.value)} />
              </div>

              {/* Adults */}
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Adults</label>
                <select className="field-dark" value={adults} onChange={e => setAdults(parseInt(e.target.value))}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Rooms */}
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase">Rooms</label>
                <select className="field-dark" value={rooms} onChange={e => setRooms(parseInt(e.target.value))}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand-hover disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap self-end">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching…</>
                  : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search Hotels</>
                }
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────── */}
      {(searched || loading) && (
        <section className="max-w-6xl mx-auto px-6 py-8" ref={resultsRef}>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-sm border border-red-400/20 bg-red-400/8">
              {error}
            </div>
          )}

          {/* Toolbar */}
          {!error && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-white/65 text-sm flex items-center gap-2">
                  {cityMeta && <span className="text-xl">{cityMeta.flag}</span>}
                  {loading ? 'Searching…' : (
                    <><span className="text-2xl font-extrabold font-display text-white">{displayed.length}</span>
                    {' '}hotels{cityMeta && <> in <strong>{cityMeta.name}</strong></>}</>
                  )}
                </span>
                {!loading && (
                  <div className="flex gap-1.5">
                    {[0,3,4,5].map(s => (
                      <button key={s} onClick={() => setMinStars(s)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer
                          ${minStars === s ? 'bg-gold/12 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/65 hover:border-gold/30'}`}>
                        {s === 0 ? 'All' : '★'.repeat(s)+'+'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!loading && (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-white/38">Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
                    className="bg-white/5 border border-white/10 text-white/65 text-sm px-3 py-1.5 rounded-lg outline-none">
                    {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* OTA banner */}
          {!loading && aff && (
            <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-2.5 rounded-xl border border-white/7 bg-white/[0.03]">
              <span className="text-[11px] text-white/38">Also search on:</span>
              {([['Agoda','#E22128',aff.agoda],['Booking.com','#4A90E2',aff.booking],['Trip.com','#1890FF',aff.trip],['Klook','#FF5C35',aff.klook],['Expedia','#00355F',aff.expedia]] as [string,string,string|undefined][])
                .filter(([,,u]) => u)
                .map(([name, color, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-[12px] font-medium text-white/65 bg-white/5 border border-white/10 px-3 py-1 rounded-full hover:text-white hover:bg-white/8 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    {name}
                  </a>
                ))}
            </div>
          )}

          {/* Skeleton */}
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

          {/* Hotel grid */}
          {!loading && displayed.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((hotel, i) => (
                <HotelCard key={hotel.hotelId} hotel={hotel} city={cityMeta ?? undefined}
                  affiliateLinks={aff ?? {}} checkIn={checkIn} checkOut={checkOut}
                  adults={adults} animDelay={i * 50} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && searched && displayed.length === 0 && !error && (
            <div className="text-center py-16 text-white/65">
              <div className="text-5xl mb-4">🔍</div>
              <p>No hotels found. Try different dates or filters.</p>
              {aff?.agoda && (
                <a href={aff.agoda} target="_blank" rel="noreferrer sponsored"
                  className="inline-block mt-5 bg-gold text-navy font-bold text-sm px-6 py-2.5 rounded-xl">
                  Search on Agoda →
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── City browse (pre-search) ───────────────────── */}
      {!searched && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="font-display text-xl font-bold text-white mb-6">Browse by destination</h2>
          {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
            <div key={country} className="mb-7">
              <h3 className="text-sm font-semibold text-white/45 mb-3">{data.flag} {country}</h3>
              <div className="flex flex-wrap gap-2">
                {data.cities.filter(c => c.hasHotels).map(c => (
                  <button key={c.slug}
                    onClick={() => { setCitySlug(c.slug); window.scrollTo({ top:0, behavior:'smooth' }); }}
                    className={`text-sm px-4 py-2 rounded-full border transition-all cursor-pointer
                      ${citySlug === c.slug ? 'bg-gold/12 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/65 hover:border-gold/35 hover:text-white hover:bg-gold/6'}`}>
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Cross-links */}
      <div className="max-w-6xl mx-auto px-6 pb-10 flex flex-wrap gap-2 border-t border-white/5 pt-6">
        {[['Flights','/flights'],['Transport','/transport'],['Activities','/activities']].map(([l,h]) => (
          <Link key={l} href={h}
            className="text-xs text-gold/70 border border-gold/20 px-4 py-1.5 rounded-full hover:bg-gold/8 transition-all">
            Also see: {l} →
          </Link>
        ))}
      </div>
    </div>
  );
}
