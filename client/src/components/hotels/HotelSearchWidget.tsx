import { useState } from "react";
import { useLocation } from "wouter";

import HotelSearchBox   from "./HotelSearchBox";
import SmartDatePicker  from "./SmartDatePicker";
import GuestSelector    from "./GuestSelector";

import {
  HotelSearchParams,
  GuestConfig,
  AutocompleteSuggestion,
} from "../../types/hotel-search.types";
import { buildHotelSearchUrl } from "../../utils/search-url.utils";

export default function HotelSearchWidget() {
  const [, setLocation] = useLocation();
  const [params, setParams] = useState<HotelSearchParams>({
    destination: "",
    locationId: "",
    locationType: "city",
    checkIn: "",
    checkOut: "",
    guests: { rooms: 1, adults: 2, children: 0 }
  });

  const handleSearch = () => {
    if (!params.destination) return alert("Please select a destination");
    if (!params.checkIn)     return alert("Please select check-in date");
    
    const url = buildHotelSearchUrl(params);
    setLocation(url);
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <HotelSearchBox
          value={params.destination}
          onSelect={(s: AutocompleteSuggestion) => setParams({
            ...params,
            destination:  s.displayName,
            locationId:   s.locationId,
            locationType: s.locationType as string
          })}
        />
        <SmartDatePicker
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          onChange={(checkIn, checkOut) => setParams({ ...params, checkIn, checkOut })}
        />
        <GuestSelector
          value={params.guests}
          onChange={(guests: GuestConfig) => setParams({ ...params, guests })}
        />
        <button
          onClick={handleSearch}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
        >
          <span>🔍</span> Search Hotels
        </button>
      </div>
    </div>
  );
}
