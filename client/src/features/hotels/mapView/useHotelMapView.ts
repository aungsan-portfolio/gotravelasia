import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { HotelResult } from "@shared/hotels/types";

import { hotelMapViewReducer, reconcileSelectedHotelId } from "./hotelMapView.reducer";
import {
  createInitialHotelMapViewState,
  type HotelMapBounds,
  type HotelMapViewState,
  type HotelResultsViewMode,
} from "./hotelMapView.types";

function areHotelIdsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((id, index) => id === b[index]);
}

export function useHotelMapView(hotels: HotelResult[]): {
  state: HotelMapViewState;
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  viewMode: HotelResultsViewMode;
  visibleHotelIds: string[];
  bounds: HotelMapBounds | null;
  searchAsMapMoves: boolean;
  setSelectedHotelId: (hotelId: string | null) => void;
  setHoveredHotelId: (hotelId: string | null) => void;
  setViewMode: (viewMode: HotelResultsViewMode) => void;
  setVisibleHotelIds: (hotelIds: string[]) => void;
  setBounds: (bounds: HotelMapBounds | null) => void;
  setSearchAsMapMoves: (enabled: boolean) => void;
  resetInteractionState: () => void;
} {
  const [state, dispatch] = useReducer(hotelMapViewReducer, hotels, createInitialHotelMapViewState);

  const hotelIds = useMemo(() => hotels.map((hotel) => hotel.hotelId), [hotels]);

  useEffect(() => {
    if (!areHotelIdsEqual(state.visibleHotelIds, hotelIds)) {
      dispatch({ type: "SET_VISIBLE_HOTEL_IDS", payload: { hotelIds } });
    }

    const nextSelectedHotelId = reconcileSelectedHotelId(state, hotels);
    if (nextSelectedHotelId !== state.selectedHotelId) {
      dispatch({ type: "SELECT_HOTEL", payload: { hotelId: nextSelectedHotelId } });
    }
  }, [hotelIds, hotels, state.selectedHotelId, state.visibleHotelIds]);

  const setSelectedHotelId = useCallback((hotelId: string | null) => {
    dispatch({ type: "SELECT_HOTEL", payload: { hotelId } });
  }, []);

  const setHoveredHotelId = useCallback((hotelId: string | null) => {
    dispatch({ type: "HOVER_HOTEL", payload: { hotelId } });
  }, []);

  const setViewMode = useCallback((viewMode: HotelResultsViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: { viewMode } });
  }, []);

  const setVisibleHotelIds = useCallback((hotelIds: string[]) => {
    dispatch({ type: "SET_VISIBLE_HOTEL_IDS", payload: { hotelIds } });
  }, []);

  const setBounds = useCallback((bounds: HotelMapBounds | null) => {
    dispatch({ type: "SET_BOUNDS", payload: { bounds } });
  }, []);

  const setSearchAsMapMoves = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_SEARCH_AS_MAP_MOVES", payload: { enabled } });
  }, []);

  const resetInteractionState = useCallback(() => {
    dispatch({ type: "RESET_INTERACTION_STATE" });
  }, []);

  return {
    state,
    selectedHotelId: state.selectedHotelId,
    hoveredHotelId: state.hoveredHotelId,
    viewMode: state.viewMode,
    visibleHotelIds: state.visibleHotelIds,
    bounds: state.bounds,
    searchAsMapMoves: state.searchAsMapMoves,
    setSelectedHotelId,
    setHoveredHotelId,
    setViewMode,
    setVisibleHotelIds,
    setBounds,
    setSearchAsMapMoves,
    resetInteractionState,
  };
}
