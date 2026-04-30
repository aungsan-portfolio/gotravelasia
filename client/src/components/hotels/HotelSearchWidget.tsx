import { Search } from "lucide-react";

import HotelSearchBox from "./HotelSearchBox";
import SmartDatePicker from "./SmartDatePicker";
import GuestSelector from "./GuestSelector";

import { useHotelSearchState } from "@/features/hotels/frontdoor/useHotelSearchState";

export default function HotelSearchWidget() {
  const {
    params,
    validation,
    handleDestinationInputChange,
    handleDestinationSelect,
    handleDatesChange,
    handleGuestsChange,
    handleSearch,
  } = useHotelSearchState();

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <HotelSearchBox
          value={params.destinationLabel}
          onInputChange={handleDestinationInputChange}
          onSelect={handleDestinationSelect}
        />
        <SmartDatePicker
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          onChange={handleDatesChange}
        />
        <GuestSelector value={params.guests} onChange={handleGuestsChange} />
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
          <p className="text-xs text-rose-200">
            {validation.errors.destination || validation.errors.city}
          </p>
        )}
        {(validation.errors.checkIn || validation.errors.checkOut) && (
          <p className="text-xs text-rose-200">
            {validation.errors.checkIn || validation.errors.checkOut}
          </p>
        )}
        {validation.errors.guests && (
          <p className="text-xs text-rose-200">{validation.errors.guests}</p>
        )}
        {validation.warnings.map(warning => (
          <p key={warning} className="text-xs text-amber-200">
            {warning}
          </p>
        ))}
      </div>
    </div>
  );
}
