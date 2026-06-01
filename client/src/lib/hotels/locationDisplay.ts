import type { HotelResult } from "@shared/hotels/types";

export interface HotelLocationDisplay {
  text: string;
  isApproximate: boolean;
}

export function getHotelLocationDisplay(hotel: HotelResult): HotelLocationDisplay {
  if (hotel.address) {
    return {
      text: hotel.address,
      isApproximate: false,
    };
  }

  if (hotel.coordinatesConfidence === "exact") {
    return {
      text: "Location available on map",
      isApproximate: true,
    };
  }

  if (
    hotel.coordinatesConfidence === "approximate" ||
    hotel.coordinatesConfidence === "fallback" ||
    hotel.coordinates
  ) {
    return {
      text: "Approximate location available",
      isApproximate: true,
    };
  }

  return {
    text: "Location unavailable",
    isApproximate: true,
  };
}
