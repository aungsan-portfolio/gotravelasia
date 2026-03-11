export interface DestinationRef {
  city: string;
  code: string;
  country?: string;
  slug?: string;
}

export interface Deal {
  from: string;
  to: string;
  d1: string;
  a1: string | null;
  airline: string;
  airlineCode?: string;
  logoUrl?: string;
  bookingUrl?: string;
  stops: number;
  duration: string;
  price: number;
  badge?: string;
  tag?: string;
}

export interface FareTableEntry {
  from1: string;
  to1: string;
  d1: string;
  a1: string | null;
  s1: number;
  dur1: string | null;

  from2?: string | null;
  to2?: string | null;
  d2?: string | null;
  a2?: string | null;
  s2?: number | null;
  dur2?: string | null;

  airline: string;
  airlineCode?: string;
  logoUrl?: string;
  bookingUrl?: string;
  price: number;
}

export interface AirlineSummary {
  code: string;
  name: string;
  logoUrl?: string;
  dealCount?: number;
  commonStops?: number;
  tags?: string[];
  confidenceLabel?: string;
}

export interface PriceMonthDatum {
  month: string;
  value: number;
  label?: string;
}

export interface HeatmapDatum {
  month: string;
  values: Array<{
    day: string;
    price: number;
    level: "low" | "mid" | "high";
  }>;
}

export interface ReviewDatum {
  airline: string;
  airlineCode?: string;
  score: number;
  highlights: string[];
}

export interface WeatherMonthDatum {
  month: string;
  rainfallMm?: number;
  avgTempC?: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RelatedRoute {
  city: string;
  code: string;
  href: string;
  tag?: string;
}

export interface StaticDestinationRecord {
  slug: string;
  origin: DestinationRef;
  dest: DestinationRef;
  heroNote?: string;

  deals: {
    cheapest: Deal[];
    fastest: Deal[];
    bestValue: Deal[];
    weekend: Deal[];
    premium: Deal[];
  };

  fareTable: FareTableEntry[];
  airlines: AirlineSummary[];

  priceMonths: PriceMonthDatum[];
  heatmap: HeatmapDatum[];
  reviews: ReviewDatum[];
  weather: WeatherMonthDatum[];

  faqs: FaqItem[];
  nearbyRoutes: RelatedRoute[];
}

export interface DestinationLandingApiResponse {
  meta: {
    origin: string;
    destination: string;
    currency: string;
    updatedAt: string;
  };
  deals: {
    cheapest: Deal[];
    fastest: Deal[];
    bestValue: Deal[];
    weekend: Deal[];
    premium: Deal[];
  };
  fareTable: FareTableEntry[];
  airlines: AirlineSummary[];
}

export interface DestinationPageVM {
  slug: string;
  origin: DestinationRef;
  dest: DestinationRef;
  currency: string;
  heroNote: string;
  updatedAt?: string;

  deals: {
    cheapest: Deal[];
    fastest: Deal[];
    bestValue: Deal[];
    weekend: Deal[];
    premium: Deal[];
  };

  fareTable: FareTableEntry[];
  airlines: AirlineSummary[];

  priceMonths: PriceMonthDatum[];
  heatmap: HeatmapDatum[];
  reviews: ReviewDatum[];
  weather: WeatherMonthDatum[];

  faqs: FaqItem[];
  nearbyRoutes: RelatedRoute[];

  lowestFare?: number;
  typicalDuration?: string;
  directAvailability?: string;

  isLiveRefreshing: boolean;
  liveFailed: boolean;
}
