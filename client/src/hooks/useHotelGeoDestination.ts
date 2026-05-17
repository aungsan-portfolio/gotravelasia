import { useState, useEffect } from "react";
import { getPopularCitiesByCountry } from "@shared/hotels/popularCitiesByCountry";
import type { City } from "@shared/hotels/cities";

export interface GeoDestinationResult {
  countryCode: string | null;
  popularCities: City[];
  isLoading: boolean;
}

export function useHotelGeoDestination(): GeoDestinationResult {
  const [result, setResult] = useState<GeoDestinationResult>({
    countryCode: null,
    popularCities: [],
    isLoading: true,
  });

  useEffect(() => {
    fetch("/api/geo")
      .then(r => r.json())
      .then((data: { country: string }) => {
        const countryCode = data.country || "MM"; // Default to MM if missing
        setResult({
          countryCode,
          popularCities: getPopularCitiesByCountry(countryCode),
          isLoading: false,
        });
      })
      .catch(() => {
        // Fallback for local dev or error
        setResult({
          countryCode: "MM",
          popularCities: getPopularCitiesByCountry("MM"),
          isLoading: false,
        });
      });
  }, []);

  return result;
}
