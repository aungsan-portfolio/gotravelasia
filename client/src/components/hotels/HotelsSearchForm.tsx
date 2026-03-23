import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CITIES_BY_COUNTRY } from "@shared/hotels/cities";
import {
  buildHotelSearchParams,
  defaultHotelDates,
  normalizeHotelSearchParams,
} from "@shared/hotels/searchParams";

interface Props {
  layout?: "default" | "compact";
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialRooms?: number;
  submitLabel?: string;
}

export default function HotelsSearchForm({
  layout = "default",
  initialCity,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialRooms,
  submitLabel = "Compare Prices",
}: Props) {
  const [, setLocation] = useLocation();
  const defaults = useMemo(() => defaultHotelDates(), []);
  const initialParams = useMemo(
    () =>
      normalizeHotelSearchParams({
        city: initialCity || "bangkok",
        checkIn: initialCheckIn || defaults.checkIn,
        checkOut: initialCheckOut || defaults.checkOut,
        adults: initialAdults,
        rooms: initialRooms,
      }),
    [
      defaults.checkIn,
      defaults.checkOut,
      initialAdults,
      initialCheckIn,
      initialCheckOut,
      initialCity,
      initialRooms,
    ]
  );

  const [citySlug, setCitySlug] = useState(initialParams.city);
  const [checkIn, setCheckIn] = useState(initialParams.checkIn);
  const [checkOut, setCheckOut] = useState(initialParams.checkOut);
  const [adults, setAdults] = useState(initialParams.adults);
  const [rooms, setRooms] = useState(initialParams.rooms);

  useEffect(() => {
    setCitySlug(initialParams.city);
    setCheckIn(initialParams.checkIn);
    setCheckOut(initialParams.checkOut);
    setAdults(initialParams.adults);
    setRooms(initialParams.rooms);
  }, [initialParams]);
  const isCompact = layout === "compact";
  const shellClassName = isCompact
    ? "flex flex-wrap items-end gap-3"
    : "flex flex-col gap-4";
  const topGridClassName = isCompact
    ? "grid flex-1 grid-cols-1 gap-3 xl:grid-cols-5"
    : "grid grid-cols-1 gap-3 md:grid-cols-4";
  const bottomGridClassName = isCompact
    ? "grid w-full grid-cols-1 gap-3 md:grid-cols-3 xl:w-auto xl:grid-cols-[110px_140px_auto]"
    : "grid grid-cols-1 gap-3 md:grid-cols-4";
  const fieldClassName = isCompact
    ? "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-yellow-400"
    : "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-400";
  const dateFieldClassName =
    `${fieldClassName} ${isCompact ? "" : "[color-scheme:dark]"}`.trim();
  const labelClassName = isCompact
    ? "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-500"
    : "mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-widest text-white/40";
  const submitClassName = isCompact
    ? "h-[46px] rounded-xl bg-purple-950 px-6 font-bold text-white transition-all hover:bg-purple-900"
    : "h-[46px] w-full rounded-xl bg-yellow-400 text-base font-bold text-[#0d0b1e] shadow-lg shadow-yellow-400/20 transition-all hover:bg-yellow-500";

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = buildHotelSearchParams({
      city: citySlug,
      checkIn,
      checkOut,
      adults,
      rooms,
      page: 1,
      sort: "rank",
    });
    setLocation(`/hotels?${params.toString()}`);
  };

  return (
    <form onSubmit={submitSearch} className={shellClassName}>
      <div className={topGridClassName}>
        <div className={isCompact ? "xl:col-span-2" : "md:col-span-2"}>
          <label className={labelClassName}>Destination</label>
          <select
            value={citySlug}
            onChange={event => setCitySlug(event.target.value)}
            className={fieldClassName}
          >
            {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
              <optgroup key={country} label={`${data.flag} ${country}`}>
                {data.cities
                  .filter(city => city.hasHotels)
                  .map(city => (
                    <option
                      key={city.slug}
                      value={city.slug}
                      className="text-gray-900"
                    >
                      {city.flag} {city.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={defaults.checkIn}
            onChange={event => setCheckIn(event.target.value)}
            required
            className={dateFieldClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={event => setCheckOut(event.target.value)}
            required
            className={dateFieldClassName}
          />
        </div>

        {isCompact && (
          <div>
            <label className={labelClassName}>Adults</label>
            <select
              value={adults}
              onChange={event => setAdults(Number(event.target.value))}
              className={fieldClassName}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(value => (
                <option key={value} value={value} className="text-gray-900">
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={bottomGridClassName}>
        <div>
          <label className={labelClassName}>Rooms</label>
          <select
            value={rooms}
            onChange={event => setRooms(Number(event.target.value))}
            className={fieldClassName}
          >
            {[1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value} className="text-gray-900">
                {value} Room{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>Adults</label>
          <select
            value={adults}
            onChange={event => setAdults(Number(event.target.value))}
            className={fieldClassName}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(value => (
              <option key={value} value={value} className="text-gray-900">
                {value} Adult{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div
          className={
            isCompact ? "flex items-end" : "flex items-end md:col-span-2"
          }
        >
          <button type="submit" className={submitClassName}>
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
