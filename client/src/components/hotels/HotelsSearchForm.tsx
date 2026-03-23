import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { CITIES_BY_COUNTRY, getHotelCities } from '@shared/hotels/cities';
import { buildHotelSearchParams, defaultHotelDates } from '@shared/hotels/searchParams';

interface Props {
  layout?: 'default' | 'compact';
  initialCity?: string;
}

export default function HotelsSearchForm({ layout = 'default', initialCity }: Props) {
  const [, setLocation] = useLocation();
  const defaults = useMemo(() => defaultHotelDates(), []);
  const hotelCities = useMemo(() => getHotelCities(), []);
  const fallbackCity = hotelCities.find((city) => city.name.toLowerCase() === initialCity?.toLowerCase())?.slug ?? hotelCities[0]?.slug ?? 'yangon';

  const [citySlug, setCitySlug] = useState(fallbackCity);
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = buildHotelSearchParams({ city: citySlug, checkIn, checkOut, adults, rooms });
    setLocation(`/hotels?${params.toString()}`);
  };

  const compact = layout === 'compact';

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
      <div className={`grid grid-cols-1 ${compact ? 'xl:grid-cols-[minmax(200px,2fr)_repeat(4,minmax(110px,1fr))_minmax(160px,1fr)]' : 'md:grid-cols-4'} gap-3`}>
        <div className={compact ? '' : 'md:col-span-2'}>
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
            Destination
          </label>
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
          >
            {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
              <optgroup key={country} label={`${data.flag} ${country}`}>
                {data.cities.filter((city) => city.hasHotels).map((city) => (
                  <option key={city.slug} value={city.slug} className="text-gray-900">
                    {city.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={defaults.checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
            Rooms
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n} className="text-gray-900">{n} Room{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
            Adults
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n} className="text-gray-900">{n} Adult{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#0d0b1e] font-bold transition-all h-[46px] rounded-xl text-base shadow-lg shadow-yellow-400/20"
          >
            Compare Prices
          </button>
        </div>
      </div>
    </form>
  );
}
