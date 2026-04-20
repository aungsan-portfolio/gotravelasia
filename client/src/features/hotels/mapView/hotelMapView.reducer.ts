import type { HotelResult } from "@shared/hotels/types";
import type { HotelMapViewAction, HotelMapViewState } from "./hotelMapView.types";

export function reconcileSelectedHotelId(
  state: HotelMapViewState,
  hotels: HotelResult[],
): string | null {
  if (!hotels.length) {
    return null;
  }

  if (state.selectedHotelId && hotels.some((hotel) => hotel.hotelId === state.selectedHotelId)) {
    return state.selectedHotelId;
  }

  return hotels[0]?.hotelId ?? null;
}

export function hotelMapViewReducer(
  state: HotelMapViewState,
  action: HotelMapViewAction,
): HotelMapViewState {
  switch (action.type) {
    case "SELECT_HOTEL":
      return {
        ...state,
        selectedHotelId: action.payload.hotelId,
      };

    case "HOVER_HOTEL":
      return {
        ...state,
        hoveredHotelId: action.payload.hotelId,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload.viewMode,
      };

    case "SET_VISIBLE_HOTEL_IDS":
      return {
        ...state,
        visibleHotelIds: action.payload.hotelIds,
      };

    case "SET_BOUNDS":
      return {
        ...state,
        bounds: action.payload.bounds,
      };

    case "SET_SEARCH_AS_MAP_MOVES":
      return {
        ...state,
        searchAsMapMoves: action.payload.enabled,
      };

    case "RESET_INTERACTION_STATE":
      return {
        ...state,
        hoveredHotelId: null,
      };

    default:
      return state;
  }
}
