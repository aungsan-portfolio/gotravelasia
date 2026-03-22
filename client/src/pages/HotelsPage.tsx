import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { HOTEL_CITIES_SORTED, CITIES_BY_COUNTRY, getCityBySlug } from '@/lib/cities';

const SORT_OPTIONS = [
  { value: 'rank',  label: 'Recommended' },
  { value: 'score', label: 'Review score' },
  { value: 'price', label: 'Lowest price' },
  { value: 'stars', label: 'Star rating'  },
];

const offset = (days: number) => {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
};

export default function HotelsPage() {
  const today   = new Date().toISOString().split('T')[0];
  const defIn   = offset(1);
  const defOut  = offset(4);

  // ── Form state ─────────────────────────────────────
  const [citySlug,  setCitySlug]  = useState('yangon');
  const [checkIn,   setCheckIn]   = useState(defIn);
  const [checkOut,  setCheckOut]  = useState(defOut);
  const [adults,    setAdults]    = useState(2);
  const [rooms,     setRooms]     = useState(1);
  const [sortBy,    setSortBy]    = useState('rank');

  // ── UI state ───────────────────────────────────────
  const [hotels,     setHotels]     = useState<any[]>([]);
  const [links,      setLinks]      = useState<any>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const city = getCityBySlug(citySlug);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        city: citySlug,
        checkIn,
        checkOut,
        adults: adults.toString(),
        rooms: rooms.toString(),
      });
      const res = await fetch(`/api/hotels/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setHotels(data.hotels || []);
      setLinks(data.affiliateLinks || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0b1e] text-white pb-20">
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative py-14 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none" 
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(245,197,24,0.08) 0%, transparent 70%)' }} 
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-4">
            Find the best hotels <span className="text-yellow-400">at the lowest price</span>
          </h1>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Compare prices from Agoda, Booking.com, Trip.com and more across 44 Asian cities.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2 justify-center bg-white/5 p-3 rounded-2xl border border-white/10 max-w-5xl mx-auto backdrop-blur-md">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1 ml-3 text-left">Destination</label>
              <select 
                value={citySlug}
                onChange={e => setCitySlug(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm font-semibold focus:ring-0 cursor-pointer px-3"
              >
                {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
                  <optgroup key={country} label={`${data.flag} ${country}`}>
                    {data.cities.filter(c => c.hasHotels).map(c => (
                      <option key={c.slug} value={c.slug} className="bg-[#1a1730]">{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="w-[1px] bg-white/10 hidden md:block" />

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1 ml-3 text-left">Check-in</label>
              <input 
                type="date" value={checkIn} min={today}
                onChange={e => setCheckIn(e.target.value)}
                className="bg-transparent border-none text-white text-sm font-semibold focus:ring-0 cursor-pointer px-3"
              />
            </div>

            <div className="w-[1px] bg-white/10 hidden md:block" />

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1 ml-3 text-left">Check-out</label>
              <input 
                type="date" value={checkOut} min={checkIn}
                onChange={e => setCheckOut(e.target.value)}
                className="bg-transparent border-none text-white text-sm font-semibold focus:ring-0 cursor-pointer px-3"
              />
            </div>

            <div className="w-[1px] bg-white/10 hidden lg:block" />

            <div className="hidden lg:block">
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1 ml-3 text-left">Guests</label>
              <select 
                value={adults} onChange={e => setAdults(parseInt(e.target.value))}
                className="bg-transparent border-none text-white text-sm font-semibold focus:ring-0 cursor-pointer px-3"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-[#1a1730]">{n} Adults</option>)}
              </select>
            </div>

            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-[#0d0b1e] font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/20">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">{city?.name || 'Hotels'}</h2>
            <p className="text-sm text-white/40">{hotels.length} hotels found</p>
          </div>
          <select 
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg text-sm px-4 py-2 outline-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#1a1730]">{o.label}</option>)}
          </select>
        </div>

        {error && <div className="p-10 text-center text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />)
          ) : (
            hotels.map((h: any) => (
              <div key={h.hotelId} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/30 transition-all group">
                <div className="h-48 relative overflow-hidden">
                  <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-[#0d0b1e] px-2 py-1 rounded-lg text-xs font-bold">
                    ★ {h.stars}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate">{h.name}</h3>
                  <p className="text-white/40 text-xs mb-3">{h.address}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#1D9E75]/20 text-[#1D9E75] px-2 py-0.5 rounded text-[10px] font-bold">{h.reviewScore}</span>
                    <span className="text-[11px] text-white/40">{h.reviewCount} reviews</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {h.amenities?.slice(0, 3).map((a: string) => (
                      <span key={a} className="text-[10px] text-white/30 border border-white/5 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                      <span className="text-[10px] text-white/40 block">From</span>
                      <span className="text-xl font-bold text-yellow-400">${h.lowestRate}</span>
                      <span className="text-[10px] text-white/40 ml-1">/ night</span>
                    </div>
                    <a 
                      href={links?.agoda || '#'} target="_blank" rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      View Deal →
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── Affiliate Links Footer ─────────────────── */}
      {links && (
        <section className="bg-white/5 border-y border-white/5 py-10 px-6 mt-10">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 items-center">
            <p className="text-sm font-bold text-white/60">Compare on other sites:</p>
            {Object.entries(links).map(([key, url]: any) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <img src={`/images/logos/${key}.png`} alt={key} className="h-6 object-contain" onError={(e:any) => e.target.style.display='none'} />
                <span className="text-xs uppercase tracking-widest font-bold ml-1">{key}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
