import { useState, useEffect } from "react";
import { AIRPORTS, type Airport } from "@/components/FloatingSearchBar/airports";

// Map Vercel country codes to local airport data names
const COUNTRY_CODE_MAP: Record<string, string> = {
  MM: "Myanmar",
  TH: "Thailand",
  SG: "Singapore",
  MY: "Malaysia",
  VN: "Vietnam",
  KH: "Cambodia",
  JP: "Japan",
  KR: "South Korea",
  AE: "UAE",
  ID: "Indonesia",
  TW: "Taiwan",
  HK: "Hong Kong",
  CN: "China",
};

const FALLBACK: Airport = AIRPORTS.find(a => a.code === "RGN")!;

export function useGeoOrigin(): Airport {
  const [origin, setOrigin] = useState<Airport>(FALLBACK);

  useEffect(() => {
    fetch("/api/geo")
      .then(r => r.json())
      .then((data: { country: string }) => {
        const countryName = COUNTRY_CODE_MAP[data.country] ?? data.country;

        const match = AIRPORTS.find(
          a => a.country.toLowerCase() === countryName.toLowerCase()
        );

        if (match) setOrigin(match);
      })
      .catch(() => {
        // Fallback to RGN in local dev or error
        console.info("[useGeoOrigin] Using fallback RGN (expected in local dev)");
      });
  }, []);

  return origin;
}
