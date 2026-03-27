import { useState, useEffect } from "react";
import { HotelResult } from "../types/hotel-search.types";

/**
 * Custom hook for fetching individual hotel details
 */
export function useHotelDetail(hotelId: string | undefined) {
  const [hotel, setHotel] = useState<HotelResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotelId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/hotels/${hotelId}`);
        if (!resp.ok) throw new Error("Hotel detail lookup failed");
        const data = await resp.json();
        setHotel(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [hotelId]);

  return { hotel, isLoading, error };
}
