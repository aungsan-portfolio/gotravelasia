
export type HotelFilterId =
  | "free_breakfast"
  | "free_cancellation"
  | "pay_later"
  | "highly_rated"
  | "budget"
  | "luxury";


export interface HotelFilterOption {
  id: HotelFilterId;
  label: string;
  description: string;
}

