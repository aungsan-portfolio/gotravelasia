import { useCallback, useEffect, useRef, useState } from "react";

import type { HotelResult, HotelSearchParams } from "@shared/hotels/types";
import { findHotelInSearchResults } from "@/lib/hotels/searchClient";

export interface UseHotelDetailFallbackResult {
  fallbackHotel: HotelResult | null;
  isFallbackLoading: boolean;
  fallbackErrorMessage: string | null;
  retryFallback: () => void;
}

/**
 * Hook to perform a fallback search for a specific hotel.
 * Used when a direct detail fetch is not possible or returns insufficient data.
 */
export function useHotelDetailFallback(
  hotelId: string | null | undefined,
  query: HotelSearchParams,
  enabled = true,
): UseHotelDetailFallbackResult {
  const [fallbackHotel, setFallbackHotel] = useState<HotelResult | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const [fallbackErrorMessage, setFallbackErrorMessage] = useState<string | null>(
    null,
  );
  const [retryToken, setRetryToken] = useState(0);
  const requestIdRef = useRef(0);

  const retryFallback = useCallback(() => {
    setRetryToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !hotelId) {
      setIsFallbackLoading(false);
      setFallbackErrorMessage(null);
      setFallbackHotel(null);
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    setIsFallbackLoading(true);
    setFallbackErrorMessage(null);

    void findHotelInSearchResults(query, hotelId, controller.signal)
      .then((hotel) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setFallbackHotel(hotel);
        setFallbackErrorMessage(null);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        setFallbackErrorMessage("Unable to load fallback hotel details.");
        setFallbackHotel(null);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsFallbackLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [enabled, hotelId, query, retryToken]);

  return {
    fallbackHotel,
    isFallbackLoading,
    fallbackErrorMessage,
    retryFallback,
  };
}
