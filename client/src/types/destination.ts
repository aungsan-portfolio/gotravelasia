// client/src/types/destination.ts

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
  badge?: string | null;
  tag?: string;
  found?: string;
}

export interface FareTableEntry {
  id?: string | number;
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
  price: number;
  bookingUrl?: string;
}

export interface AirlineSummary {
  code: string;
  name: string;
  logoUrl?: string;
  dealCount?: number;
  commonStops?: number;
  avgPrice?: number;
  tags?: string[];
  confidenceLabel?: string;
}

export interface PriceMonthDatum {
  month: string;
  value: number;
  label?: string;
}

export interface HeatmapCellDatum {
  day: string;
  price: number;
  level: "low" | "mid" | "high";
}

export interface HeatmapDatum {
  month: string;
  values: HeatmapCellDatum[];
}

export interface AdvanceBookingDatum {
  days: number;
  avgPrice: number;
}

export interface TimeOfDayDatum {
  slot: "Morning" | "Afternoon" | "Evening" | "Night";
  avgPrice: number;
}

export interface ReviewSubScore {
  label: string;
  score: number; // 0–10
}

export interface ReviewDatum {
  airline: string;
  airlineCode?: string;
  logoUrl?: string;
  score: number;
  highlights: string[];
  subScores?: ReviewSubScore[];
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

// ── Deals are now month-keyed: "2026-04" → Deal[]  ────────────────
export interface StaticDestinationRecord {
  slug: string;
  origin: DestinationRef;
  dest: DestinationRef;
  heroNote?: string;
  /** Keys are ISO month strings like "2026-04", "2026-05" */
  deals: Record<string, Deal[]>;
  fareTable: FareTableEntry[];
  airlines: AirlineSummary[];
  priceMonths: PriceMonthDatum[];
  heatmap: HeatmapDatum[];
  advanceBooking: AdvanceBookingDatum[];
  timeOfDay: TimeOfDayDatum[];
  reviews: ReviewDatum[];
  weather: WeatherMonthDatum[];
  faqs: FaqItem[];
  nearbyRoutes: RelatedRoute[];
  climate?: string;
  highlights?: string[];
  priceRatio?: number;
  type?: "country" | "city" | "airport";
}

/** Dynamic string key — e.g. "2026-04" */
export type DealTabKey = string;

export type DestinationLiveState = "static" | "live" | "partial" | "error";

export interface DestinationStatusVM {
  state: DestinationLiveState;
  label: string;
  tone: "green" | "amber" | "red";
  lastUpdatedLabel: string | null;
  sourceLabel: string | null;
  isLive: boolean;
  isFallback: boolean;
  isPartial: boolean;
}

export interface HeroSummaryChipVM {
  label: string;
  value: string | number;
  subValue: string;
}

// ── NEW: props powering the interactive search form in HeroSearch ──
export interface HeroSearchFormVM {
  originCode: string;
  originLabel: string;
  destinationCode: string;
  destinationLabel: string;
  defaultTripType: "return" | "oneway";
  defaultDepartDate: string;   // YYYY-MM-DD
  defaultReturnDate: string | null;
  defaultPassengers: number;
  bookingSearchUrl: string;
}

export interface NormalizedDealVM extends Deal {
  id: string;
  badge: string | null;
  stopBadgeTone: "green" | "amber" | "red";
  departLabel: string;
  arrivalLabel: string;
  priceLabel: string;
  isDirect: boolean;
  isOneStop: boolean;
  found?: string;
}

export interface FareLegVM {
  route: string;
  departLabel: string;
  arrivalLabel: string;
  stopsLabel: string;
  durationLabel: string;
  stopBadgeTone: "green" | "amber" | "red";
}

export interface NormalizedFareEntryVM extends FareTableEntry {
  id: string | number;
  tripType: "oneway" | "return";
  priceLabel: string;
  outbound: FareLegVM;
  returnLeg: FareLegVM | null;
}

export interface DealTabVM {
  key: DealTabKey;
  label: string;       // "Apr 2026"
  monthLabel: string;  // "April"  ← NEW
  count: number;
  bestPrice: number | null;
  bestPriceLabel: string;
  items: NormalizedDealVM[];
}

export interface DealsSummaryVM {
  totalDeals: number;
  avgPrice: number;
  avgPriceLabel: string;
  cheapestPrice: number | null;
  cheapestPriceLabel: string;
  cheapestCarrier: string | null;
  highestPrice: number | null;
  directCount: number;
}

export interface FareFinderOriginOptionVM {
  label: string;
  value: string;
}

export interface FareFinderSummaryVM {
  cheapestFareLabel: string;
  entryCount: number;
  budgetMin: number;
  budgetMax: number;
  defaultBudget: number;
  budgetStep: number;
  filteredCountLabel: string;
}

export interface InsightsSummaryVM {
  cheapestMonth: string;
  cheapestMonthLabel: string;
  priciestMonth: string;
  priciestMonthLabel: string;
  lowestHeatmapCell: string;
  highestHeatmapCell: string;
}

export interface AirlinesWeatherSummaryVM {
  airlineCount: number;
  topCarrier: string;
  warmestMonth: string;
  wettestMonth: string;
}

export interface ReviewsSummaryVM {
  topAirline: string;
  topScore: number | null;
  avgScore: number;
}

export interface BrowseLinkVM {
  label: string;
  href: string;
}

export interface SeoVM {
  title: string;
  description?: string;
  canonicalPath: string;
}

export interface RouteVM {
  origin: DestinationRef;
  destination: DestinationRef;
  routeLabel: string;
  heroNote?: string;
  bookingCtaHref: string;
  bookingCtaLabel: string;
  climate?: string;
  highlights?: string;
  priceRatio?: number;
}


export interface HeroVM {
  title: string;
  subtitle?: string;
  originLabel: string;
  destinationLabel: string;
  badge: string;
  summaryChips: HeroSummaryChipVM[];
  searchForm: HeroSearchFormVM;   // ← NEW
}

export interface DealsVM {
  title: string;
  subtitle: string;
  activeTab: DealTabKey;
  tabs: DealTabVM[];
  summary: DealsSummaryVM;
}

export interface FareFinderVM {
  title: string;
  subtitle: string;
  originOptions: FareFinderOriginOptionVM[];
  defaultOrigin: string;
  entries: NormalizedFareEntryVM[];
  summary: FareFinderSummaryVM;
}

export interface InsightsVM {
  title: string;
  subtitle: string;
  priceMonths: PriceMonthDatum[];
  heatmap: HeatmapDatum[];
  advanceBooking: AdvanceBookingDatum[];
  timeOfDay: TimeOfDayDatum[];
  summary: InsightsSummaryVM;
}

export interface AirlinesWeatherVM {
  title: string;
  subtitle: string;
  airlines: AirlineSummary[];
  weather: WeatherMonthDatum[];
  summary: AirlinesWeatherSummaryVM;
  climate?: string;
}


export interface ReviewsVM {
  title: string;
  subtitle: string;
  items: ReviewDatum[];
  defaultAirlineCode: string | null;
  summary: ReviewsSummaryVM;
  highlights?: string;
}


export interface FooterVM {
  title: string;
  faqs: FaqItem[];
  nearbyRoutes: RelatedRoute[];
  browseLinks: BrowseLinkVM[];
}

/** A city card displayed in the CountryNavigator for country-level pages. */
export interface CountryCityVM {
  name: string;
  code: string;
  slug: string;
  startingFrom: string | null;
  href: string;
}

export interface DestinationPageVM {
  slug: string;
  canonicalPath: string;
  status: DestinationStatusVM;
  route: RouteVM;
  hero: HeroVM;
  deals: DealsVM;
  fareFinder: FareFinderVM;
  insights: InsightsVM;
  airlinesWeather: AirlinesWeatherVM;
  reviews: ReviewsVM;
  footer: FooterVM;
  seo: SeoVM;
  raw: StaticDestinationRecord;
  /** True when the page is a country-level destination (e.g. China, Japan). */
  isCountry: boolean;
  /** Major cities within the country, used by CountryNavigator. Empty for city pages. */
  countryCities: CountryCityVM[];
}

export type NormalizedDeal = NormalizedDealVM;
export type NormalizedFareTableEntry = NormalizedFareEntryVM;

export interface DestinationLandingApiMeta {
  origin?: string;
  destination?: string;
  currency?: string;
  updatedAt?: string;
}

export interface DestinationLandingApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  meta?: DestinationLandingApiMeta;
  lastUpdated?: string;
  data?: unknown;
  payload?: unknown;
  result?: unknown;
  destinationData?: unknown;
  page?: unknown;
}
