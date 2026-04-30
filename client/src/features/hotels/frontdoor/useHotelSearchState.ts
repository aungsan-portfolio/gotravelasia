import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import type { AutocompleteSuggestion, GuestConfig } from "@/types/hotel-search.types";
import type { HotelFrontDoorFormState } from "@/features/hotels/frontdoor/hotelFrontDoor.types";
import { validateHotelFrontDoor } from "@/features/hotels/frontdoor/hotelFrontDoor.validation";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

interface DestinationSelectPayload {
  suggestion: AutocompleteSuggestion;
}

const INITIAL_STATE: HotelFrontDoorFormState = {
  destinationLabel: "",
  city: "",
  cityName: "",
  destinationSource: undefined,
  checkIn: "",
  checkOut: "",
  guests: { rooms: 1, adults: 2, children: 0 },
};

/**
 * Custom hook to manage the state of the hotel search front-door widget.
 * Centralizes state management and validation logic away from the UI component.
 */
export function useHotelSearchState() {
  const [, setLocation] = useLocation();
  const [params, setParams] = useState<HotelFrontDoorFormState>(INITIAL_STATE);

  const validation = useMemo(() => validateHotelFrontDoor(params), [params]);

  const handleDestinationInputChange = (value: string) => {
    setParams(prev => ({
      ...prev,
      destinationLabel: value,
      city: "",
      cityName: "",
      destinationSource: undefined,
    }));
  };

  const handleDestinationSelect = ({ suggestion }: DestinationSelectPayload) => {
    setParams(prev => ({
      ...prev,
      destinationLabel: suggestion.displayName,
      city: suggestion.locationId,
      cityName: suggestion.displayName,
      destinationSource: /^\d+$/.test(suggestion.locationId) ? "agoda" : "local",
    }));
  };

  const handleDatesChange = (checkIn: string, checkOut: string) => {
    setParams(prev => ({ ...prev, checkIn, checkOut }));
  };

  const handleGuestsChange = (guests: GuestConfig) => {
    setParams(prev => ({ ...prev, guests }));
  };

  const handleSearch = () => {
    if (!validation.isValid) return;

    const query = buildHotelSearchParams({
      city: params.city,
      cityName: params.cityName || params.destinationLabel,
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

  return {
    params,
    validation,
    handleDestinationInputChange,
    handleDestinationSelect,
    handleDatesChange,
    handleGuestsChange,
    handleSearch,
  };
}
