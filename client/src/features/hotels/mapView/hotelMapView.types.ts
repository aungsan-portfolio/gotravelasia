import type { HotelResult } from "@shared/hotels/types";

export type HotelResultsViewMode = "split" | "list_only" | "map_only";

export interface HotelMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface HotelMapViewState {
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  viewMode: HotelResultsViewMode;
  visibleHotelIds: string[];
  bounds: HotelMapBounds | null;
  searchAsMapMoves: boolean;
}

export type HotelMapViewAction =
  | { type: "SELECT_HOTEL"; payload: { hotelId: string | null } }
  | { type: "HOVER_HOTEL"; payload: { hotelId: string | null } }
  | { type: "SET_VIEW_MODE"; payload: { viewMode: HotelResultsViewMode } }
  | { type: "SET_VISIBLE_HOTEL_IDS"; payload: { hotelIds: string[] } }
  | { type: "SET_BOUNDS"; payload: { bounds: HotelMapBounds | null } }
  | { type: "SET_SEARCH_AS_MAP_MOVES"; payload: { enabled: boolean } }
  | { type: "RESET_INTERACTION_STATE" };

export function createInitialHotelMapViewState(hotels: HotelResult[]): HotelMapViewState {
  return {
    selectedHotelId: hotels[0]?.hotelId ?? null,
    hoveredHotelId: null,
    viewMode: "split",
    visibleHotelIds: hotels.map((hotel) => hotel.hotelId),
    bounds: null,
    searchAsMapMoves: false,
  };
}
