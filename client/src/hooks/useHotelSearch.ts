import { useState, useEffect } from "react";
import { HotelResult, HotelSearchParams } from "../types/hotel-search.types";

/**
 * Custom hook for fetching hotel search results
 */
export function useHotelSearch(params: HotelSearchParams) {
  const [results, setResults] = useState<HotelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.destination || !params.checkIn || !params.checkOut) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          q: params.destination,
          id: params.locationId,
          type: params.locationType,
          checkin: params.checkIn,
          checkout: params.checkOut,
          adults: params.guests.adults.toString(),
          rooms: params.guests.rooms.toString(),
          children: params.guests.children.toString(),
        });

        const resp = await fetch(`/api/hotels/search?${queryParams.toString()}`);
        if (!resp.ok) throw new Error("Hotel search failed");
        const data = await resp.json();
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [params.destination, params.locationId, params.checkIn, params.checkOut, params.guests]);

  return { results, isLoading, error };
}
