export type TripType = "roundtrip" | "oneway";

export type NormalizedFlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
};
