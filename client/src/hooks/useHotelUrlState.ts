import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelRichFilters } from "@/lib/hotels/filterEngine";
import type { MarkerBounds } from "@/features/hotels/mapView/markers.types";
import type { HotelSort } from "@shared/hotels/types";

// ─── URL Param Keys ────────────────────────────────────────────────

const URL_KEYS = {
  FILTERS: "filters",
  PRICE_MIN: "priceMin",
  PRICE_MAX: "priceMax",
  STARS: "stars",
  MIN_RATING: "minRating",
  AMENITIES: "amenities",
  MAP_NORTH: "mapN",
  MAP_SOUTH: "mapS",
  MAP_EAST: "mapE",
  MAP_WEST: "mapW",
} as const;

// ─── Types ─────────────────────────────────────────────────────────

export interface HotelUrlFilterState {
  activeFilters: HotelFilterId[];
  richFilters: HotelRichFilters;
  mapBounds: MarkerBounds | null;
}

// ─── Parse from URL ────────────────────────────────────────────────

export function parseHotelUrlFilterState(search: string): HotelUrlFilterState {
  const params = new URLSearchParams(search);

  // Quick filters
  const filtersRaw = params.get(URL_KEYS.FILTERS);
  const activeFilters: HotelFilterId[] = filtersRaw
    ? (filtersRaw.split(",").filter(Boolean) as HotelFilterId[])
    : [];

  // Rich filters
  const richFilters: HotelRichFilters = {};

  const priceMin = parseFloat(params.get(URL_KEYS.PRICE_MIN) || "");
  const priceMax = parseFloat(params.get(URL_KEYS.PRICE_MAX) || "");
  if (Number.isFinite(priceMin) || Number.isFinite(priceMax)) {
    richFilters.priceRange = {
      ...(Number.isFinite(priceMin) ? { min: priceMin } : {}),
      ...(Number.isFinite(priceMax) ? { max: priceMax } : {}),
    };
  }

  const starsRaw = params.get(URL_KEYS.STARS);
  if (starsRaw) {
    const stars = starsRaw
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
    if (stars.length) richFilters.starRatings = stars;
  }

  const minRating = parseFloat(params.get(URL_KEYS.MIN_RATING) || "");
  if (Number.isFinite(minRating) && minRating > 0) {
    richFilters.minGuestRating = minRating;
  }

  const amenitiesRaw = params.get(URL_KEYS.AMENITIES);
  if (amenitiesRaw) {
    const amenities = amenitiesRaw.split(",").filter(Boolean);
    if (amenities.length) richFilters.amenities = amenities;
  }

  // Map bounds
  const mapN = parseFloat(params.get(URL_KEYS.MAP_NORTH) || "");
  const mapS = parseFloat(params.get(URL_KEYS.MAP_SOUTH) || "");
  const mapE = parseFloat(params.get(URL_KEYS.MAP_EAST) || "");
  const mapW = parseFloat(params.get(URL_KEYS.MAP_WEST) || "");

  const mapBounds: MarkerBounds | null =
    Number.isFinite(mapN) &&
    Number.isFinite(mapS) &&
    Number.isFinite(mapE) &&
    Number.isFinite(mapW)
      ? { north: mapN, south: mapS, east: mapE, west: mapW }
      : null;

  return { activeFilters, richFilters, mapBounds };
}

// ─── Serialize to URL ──────────────────────────────────────────────

export function buildHotelFilterUrlParams(state: HotelUrlFilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Quick filters
  if (state.activeFilters.length) {
    params.set(URL_KEYS.FILTERS, state.activeFilters.join(","));
  }

  // Rich filters
  if (state.richFilters.priceRange?.min != null) {
    params.set(URL_KEYS.PRICE_MIN, String(state.richFilters.priceRange.min));
  }
  if (state.richFilters.priceRange?.max != null) {
    params.set(URL_KEYS.PRICE_MAX, String(state.richFilters.priceRange.max));
  }
  if (state.richFilters.starRatings?.length) {
    params.set(URL_KEYS.STARS, state.richFilters.starRatings.join(","));
  }
  if (state.richFilters.minGuestRating != null) {
    params.set(URL_KEYS.MIN_RATING, String(state.richFilters.minGuestRating));
  }
  if (state.richFilters.amenities?.length) {
    params.set(URL_KEYS.AMENITIES, state.richFilters.amenities.join(","));
  }

  // Map bounds (rounded to 4 decimal places for compact URLs)
  if (state.mapBounds) {
    params.set(URL_KEYS.MAP_NORTH, state.mapBounds.north.toFixed(4));
    params.set(URL_KEYS.MAP_SOUTH, state.mapBounds.south.toFixed(4));
    params.set(URL_KEYS.MAP_EAST, state.mapBounds.east.toFixed(4));
    params.set(URL_KEYS.MAP_WEST, state.mapBounds.west.toFixed(4));
  }

  return params;
}

// ─── Hook: Sync filter/map state to URL ────────────────────────────

/**
 * useHotelUrlState — Bidirectional sync between hotel filter/map state and URL.
 *
 * On mount: reads filter state from URL query params.
 * On state change: updates URL query params (without full navigation).
 *
 * This enables:
 * - Shareable filtered hotel search URLs
 * - Browser back/forward preserves filter state
 * - Bookmarkable map positions
 */
export function useHotelUrlState(input: {
  activeFilters: HotelFilterId[];
  richFilters: HotelRichFilters;
  mapBounds: MarkerBounds | null;
  sort: HotelSort;
  onRestoreFilters?: (state: HotelUrlFilterState) => void;
}) {
  const [pathname] = useLocation();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const initializedRef = useRef(false);
  const [hasRestored, setHasRestored] = useState(false);
  const lastSerializedRef = useRef<string>("");

  // 1. Restore state from URL on initial mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const restored = parseHotelUrlFilterState(searchString);
    const hasState =
      restored.activeFilters.length > 0 ||
      Object.keys(restored.richFilters).length > 0 ||
      restored.mapBounds != null;

    if (hasState && input.onRestoreFilters) {
      input.onRestoreFilters(restored);
    }
    
    // Defer URL serialization to the next cycle so React has time to apply the restored state
    setHasRestored(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Sync state TO URL when filter/map changes
  useEffect(() => {
    if (!initializedRef.current || !hasRestored) return;

    const filterParams = buildHotelFilterUrlParams({
      activeFilters: input.activeFilters,
      richFilters: input.richFilters,
      mapBounds: input.mapBounds,
    });

    const serialized = filterParams.toString();

    // Don't update URL if nothing changed
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;

    // Merge with existing search params (preserve city, checkIn, etc.)
    const currentParams = new URLSearchParams(searchString);

    // Remove old filter keys
    for (const key of Object.values(URL_KEYS)) {
      currentParams.delete(key);
    }

    // Add new filter keys
    for (const [key, value] of filterParams.entries()) {
      currentParams.set(key, value);
    }

    const newSearch = currentParams.toString();
    const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;

    // Use replace to avoid polluting browser history with every filter toggle
    setLocation(newUrl, { replace: true });
  }, [
    input.activeFilters,
    input.richFilters,
    input.mapBounds,
    pathname,
    searchString,
    setLocation,
  ]);
}
