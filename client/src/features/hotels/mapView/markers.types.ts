export interface MarkerCoordinates {
  lat: number;
  lng: number;
}

export interface MarkerBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface HotelMapMarkerStyle {
  variant: "default" | "hovered" | "selected" | "deal";
  showPulse?: boolean;
}

export interface HotelMapMarker {
  hotelId: string;
  position: MarkerCoordinates;
  price: number;
  currency?: string;
  label: string;
  isVisible: boolean;
  isHovered: boolean;
  isSelected: boolean;
  style: HotelMapMarkerStyle;
  zIndex: number;
}

export interface HotelMapMarkerCluster {
  type: "single" | "cluster";
  position: MarkerCoordinates;
  hotelIds: string[];
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  marker?: HotelMapMarker;
}
