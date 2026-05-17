export interface HotellookSearchStartResponse {
  search_id: string;
}

export interface HotellookLocation {
  name: string;
  geo: {
    lat: number;
    lon: number;
  };
}

export interface HotellookHotelProps {
  [key: string]: boolean | number | string;
}

export interface HotellookHotel {
  hotelId: number;
  hotelName: string;
  stars: number;
  rating: number; // 0-100
  popularity: number;
  location: HotellookLocation;
  priceFrom: number;
  props: HotellookHotelProps;
  // Additional fields returned by Hotellook API if needed
}

export interface HotellookResultsResponse {
  status: "ok" | "searching" | "error";
  hotels: HotellookHotel[];
}
