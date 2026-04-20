import type { HotelResult } from "@shared/hotels/types";

import { formatPriceLabel } from "./formatPriceLabel";
import type { HotelMapMarker, HotelMapMarkerCluster, MarkerBounds } from "./markers.types";

interface MarkerGenerationState {
  selectedHotelId?: string | null;
  hoveredHotelId?: string | null;
  bounds?: MarkerBounds | null;
  dealHotelIds?: string[];
}

function hasValidCoordinates(hotel: HotelResult): hotel is HotelResult & {
  coordinates: { lat: number; lng: number };
} {
  return Boolean(
    hotel.coordinates &&
      Number.isFinite(hotel.coordinates.lat) &&
      Number.isFinite(hotel.coordinates.lng),
  );
}

export function isWithinBounds(
  coords: { lat: number; lng: number },
  bounds: MarkerBounds,
): boolean {
  return (
    coords.lat <= bounds.north &&
    coords.lat >= bounds.south &&
    coords.lng <= bounds.east &&
    coords.lng >= bounds.west
  );
}

export function deriveBoundsFromHotels(hotels: HotelResult[]): MarkerBounds | null {
  const mappedHotels = hotels.filter(hasValidCoordinates);

  if (!mappedHotels.length) {
    return null;
  }

  const [firstHotel, ...restHotels] = mappedHotels;
  const initial = {
    north: firstHotel.coordinates.lat,
    south: firstHotel.coordinates.lat,
    east: firstHotel.coordinates.lng,
    west: firstHotel.coordinates.lng,
  };

  return restHotels.reduce((bounds, hotel) => {
    const { lat, lng } = hotel.coordinates;

    return {
      north: Math.max(bounds.north, lat),
      south: Math.min(bounds.south, lat),
      east: Math.max(bounds.east, lng),
      west: Math.min(bounds.west, lng),
    };
  }, initial);
}

export function generateMapMarkers(
  hotels: HotelResult[],
  state: MarkerGenerationState,
): HotelMapMarker[] {
  const selectedHotelId = state.selectedHotelId ?? null;
  const hoveredHotelId = state.hoveredHotelId ?? null;
  const dealHotelIds = new Set(state.dealHotelIds ?? []);

  return hotels
    .filter(hasValidCoordinates)
    .map((hotel, index): HotelMapMarker => {
      const isSelected = hotel.hotelId === selectedHotelId;
      const isHovered = hotel.hotelId === hoveredHotelId;
      const isVisible = state.bounds
        ? isWithinBounds(
            { lat: hotel.coordinates.lat, lng: hotel.coordinates.lng },
            state.bounds,
          )
        : true;

      const style = isSelected
        ? { variant: "selected" as const, showPulse: true }
        : isHovered
          ? { variant: "hovered" as const }
          : dealHotelIds.has(hotel.hotelId)
            ? { variant: "deal" as const }
            : { variant: "default" as const };

      const zIndex = isSelected ? 3000 : isHovered ? 2000 : 1000 - index;

      return {
        hotelId: hotel.hotelId,
        position: {
          lat: hotel.coordinates.lat,
          lng: hotel.coordinates.lng,
        },
        price: hotel.lowestRate,
        currency: hotel.currency,
        label: formatPriceLabel(hotel.lowestRate, hotel.currency),
        isVisible,
        isHovered,
        isSelected,
        style,
        zIndex,
      };
    });
}

export function clusterMarkers(
  markers: HotelMapMarker[],
  zoom: number,
  clusterRadius = 0.03,
): HotelMapMarkerCluster[] {
  if (zoom >= 12) {
    return markers.map((marker) => ({
      type: "single",
      position: marker.position,
      hotelIds: [marker.hotelId],
      count: 1,
      minPrice: marker.price,
      maxPrice: marker.price,
      marker,
    }));
  }

  const buckets = new Map<string, HotelMapMarker[]>();

  for (const marker of markers) {
    const latBucket = Math.round(marker.position.lat / clusterRadius);
    const lngBucket = Math.round(marker.position.lng / clusterRadius);
    const key = `${latBucket}:${lngBucket}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.push(marker);
    } else {
      buckets.set(key, [marker]);
    }
  }

  return Array.from(buckets.values()).map((bucket): HotelMapMarkerCluster => {
    if (bucket.length === 1) {
      const marker = bucket[0];

      return {
        type: "single",
        position: marker.position,
        hotelIds: [marker.hotelId],
        count: 1,
        minPrice: marker.price,
        maxPrice: marker.price,
        marker,
      };
    }

    const hotelIds = bucket.map((marker) => marker.hotelId);
    const prices = bucket
      .map((marker) => marker.price)
      .filter((price) => Number.isFinite(price));

    const averagePosition = bucket.reduce(
      (acc, marker) => ({
        lat: acc.lat + marker.position.lat,
        lng: acc.lng + marker.position.lng,
      }),
      { lat: 0, lng: 0 },
    );

    return {
      type: "cluster",
      position: {
        lat: averagePosition.lat / bucket.length,
        lng: averagePosition.lng / bucket.length,
      },
      hotelIds,
      count: bucket.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  });
}
