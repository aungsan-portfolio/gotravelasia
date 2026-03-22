/**
 * client/src/components/home/HotelSearchPreview.tsx
 * ===================================================
 * DROP-IN: Old hotel form / Agoda embed ကို ဒီ component နဲ့ replace
 *
 * Usage in Home.tsx:
 *   // ဟောင်းဟာ ဖယ်ပြီး ဒါ ထည့်
 *   import HotelSearchPreview from '../components/home/HotelSearchPreview';
 *   <HotelSearchPreview />
 */

import { useState }       from 'react';
import { useLocation }    from 'wouter';
import { CITIES_BY_COUNTRY } from '../../lib/cities';
import { dateOffset }     from '../../lib/twelveGo';

export default function HotelSearchPreview() {
  const [, navigate] = useLocation();

  const today   = new Date().toISOString().split('T')[0];
  const [city,     setCity]     = useState('yangon');
  const [checkIn,  setCheckIn]  = useState(dateOffset(1));
  const [checkOut, setCheckOut] = useState(dateOffset(4));
  const [adults,   setAdults]   = useState(2);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/hotels?city=${city}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`);
  }

  return (
    <form onSubmit={handleSearch}
      className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">

      <div className="flex flex-wrap gap-2 items-end">

        {/* Destination — grouped by country */}
        <div className="flex flex-col gap-1 flex-[2] min-w-[170px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">
            Destination
          </label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50 transition-colors"
          >
            {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
              <optgroup key={country} label={`${data.flag} ${country}`}>
                {data.cities
                  .filter(c => c.hasHotels)
                  .map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.flag} {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={e => setCheckIn(e.target.value)}
            className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50"
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={e => setCheckOut(e.target.value)}
            className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-[#f5c842]/50"
          />
        </div>

        {/* Adults */}
        <div className="flex flex-col gap-1 w-[72px]">
          <label className="text-[10px] font-semibold text-white/35 tracking-widest uppercase text-left">
            Adults
          </label>
          <select
            value={adults}
            onChange={e => setAdults(parseInt(e.target.value))}
            className="bg-white/7 border border-white/12 rounded-xl text-white px-3 py-2.5 text-sm outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
               <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center gap-2 bg-[#ff6b2b] hover:bg-[#e85a1e] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap self-end"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search Hotels
        </button>
      </div>

      {/* OTA source logos */}
      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        <span className="text-[10px] text-white/28">Compare prices from</span>
        {[
          ['Agoda',       '#E22128'],
          ['Booking.com', '#4A90E2'],
          ['Trip.com',    '#1890FF'],
          ['Expedia',     '#4169E1'],
          ['Klook',       '#FF5C35'],
        ].map(([name, color]) => (
          <span key={name}
            className="text-[11px] font-semibold flex items-center gap-1"
            style={{ color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
    </form>
  );
}
