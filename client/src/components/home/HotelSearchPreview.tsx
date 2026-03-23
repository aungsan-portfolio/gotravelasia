import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { CITIES_BY_COUNTRY, getHotelCities } from '@shared/hotels/cities';
import { buildHotelSearchParams, defaultHotelDates } from '@shared/hotels/searchParams';

export default function HotelSearchPreview() {
  const [, navigate] = useLocation();
  const defaults = useMemo(() => defaultHotelDates(), []);
  const hotelCities = useMemo(() => getHotelCities(), []);

  const [city, setCity] = useState(hotelCities[0]?.slug ?? 'yangon');
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = buildHotelSearchParams({ city, checkIn, checkOut, adults, rooms });
    navigate(`/hotels?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1 flex-[2] min-w-[170px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">Destination</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50 transition-colors">
            {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
              <optgroup key={country} label={`${data.flag} ${country}`}>
                {data.cities.filter((entry) => entry.hasHotels).map((entry) => (
                  <option key={entry.slug} value={entry.slug}>{entry.flag} {entry.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">Check-in</label>
          <input type="date" value={checkIn} min={defaults.checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50" />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">Check-out</label>
          <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50" />
        </div>

        <div className="flex flex-col gap-1 w-[72px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">Adults</label>
          <select value={adults} onChange={(e) => setAdults(Number.parseInt(e.target.value, 10))} className="bg-white/7 border border-white/12 rounded-xl text-white px-3 py-2.5 text-sm outline-none">
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-[72px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">Rooms</label>
          <select value={rooms} onChange={(e) => setRooms(Number.parseInt(e.target.value, 10))} className="bg-white/7 border border-white/12 rounded-xl text-white px-3 py-2.5 text-sm outline-none">
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <button type="submit" className="flex items-center gap-2 bg-[#ff6b2b] hover:bg-[#e85a1e] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap self-end">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search Hotels
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        <span className="text-[10px] text-white/28">Compare prices from</span>
        {[
          ['Agoda', '#E22128'],
          ['Booking.com', '#4A90E2'],
          ['Trip.com', '#1890FF'],
          ['Expedia', '#4169E1'],
          ['Klook', '#FF5C35'],
        ].map(([name, color]) => (
          <span key={name} className="text-[11px] font-semibold flex items-center gap-1" style={{ color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
    </form>
  );
}
