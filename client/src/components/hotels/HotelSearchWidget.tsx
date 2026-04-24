import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

import HotelSearchBox from "./HotelSearchBox";
import SmartDatePicker from "./SmartDatePicker";
import GuestSelector from "./GuestSelector";

import type { GuestConfig } from "../../types/hotel-search.types";
import type { HotelFrontDoorFormState } from "@/features/hotels/frontdoor/hotelFrontDoor.types";
import { validateHotelFrontDoor } from "@/features/hotels/frontdoor/hotelFrontDoor.validation";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

export default function HotelSearchWidget() {
  const [, setLocation] = useLocation();
  const [params, setParams] = useState<HotelFrontDoorFormState>({
    destinationLabel: "",
    citySlug: "",
    checkIn: "",
    checkOut: "",
    guests: { rooms: 1, adults: 2, children: 0 },
  });

  const validation = useMemo(() => validateHotelFrontDoor(params), [params]);

  const handleSearch = () => {
    if (!validation.isValid) return;

    const query = buildHotelSearchParams({
      city: params.citySlug,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      adults: params.guests.adults,
      rooms: params.guests.rooms,
      page: 1,
      sort: "best",
    });

    // NOTE:
    // Router currently has /hotels and canonical /hotels/:destination/... routes,
    // but not /hotels/search. Keep front-door search on the legacy /hotels route.
    setLocation(`/hotels?${query.toString()}`);
  };

  const updateGuests = (guests: GuestConfig) => {
    setParams((prev) => ({ ...prev, guests }));
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <HotelSearchBox
          value={params.destinationLabel}
          onInputChange={(value) => {
            setParams((prev) => ({
              ...prev,
              destinationLabel: value,
              citySlug: "",
            }));
          }}
          onSelect={({ suggestion, citySlug }) =>
            setParams((prev) => ({
              ...prev,
              destinationLabel: suggestion.displayName,
              citySlug: citySlug ?? "",
            }))
          }
        />
        <SmartDatePicker
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          onChange={(checkIn, checkOut) => setParams((prev) => ({ ...prev, checkIn, checkOut }))}
        />
        <GuestSelector value={params.guests} onChange={updateGuests} />
        <button
          type="button"
          data-testid="hotel-search-submit"
          disabled={!validation.isValid}
          onClick={handleSearch}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
        >
          <Search className="h-4 w-4" aria-hidden="true" /> Search Hotels
        </button>
      </div>

      <div className="space-y-1 px-1">
        {(validation.errors.destination || validation.errors.city) && (
          <p className="text-xs text-rose-200">{validation.errors.destination || validation.errors.city}</p>
        )}
        {(validation.errors.checkIn || validation.errors.checkOut) && (
          <p className="text-xs text-rose-200">{validation.errors.checkIn || validation.errors.checkOut}</p>
        )}
        {validation.errors.guests && <p className="text-xs text-rose-200">{validation.errors.guests}</p>}
        {validation.warnings.map((warning) => (
          <p key={warning} className="text-xs text-amber-200">{warning}</p>
        ))}
      </div>
    </div>
  );
}
