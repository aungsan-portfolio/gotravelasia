import posthog from "posthog-js";

export interface HotelTrackingContext {
  hotelId?: string;
  city?: string;
  destinationLabel?: string;
  cityName?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  rooms?: number;
  children?: number;
  sort?: string;
  filters?: Record<string, unknown>;
  filterId?: string;
  filterType?: string;
  filterValue?: string | number | boolean | string[] | number[];
  dealId?: string;
  dealTitle?: string;
  source?: string;
  errorMessage?: string;
  resultCount?: number;
  mappedCount?: number;
  resultPosition?: number;
  provider?: "agoda" | "booking" | "trip" | "expedia" | "klook";
}

function sanitizeString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function sanitizeNumber(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function sanitizeBoolean(value?: boolean): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function sanitizePrimitiveArray(
  value?: string[] | number[],
): string[] | number[] | undefined {
  return Array.isArray(value) && value.length > 0 ? value : undefined;
}

/**
 * Builds a clean tracking payload from the provided context.
 * Filters out invalid or empty values to maintain data quality in analytics.
 */
export function buildHotelTrackingPayload(
  context: HotelTrackingContext,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const hotelId = sanitizeString(context.hotelId);
  const city = sanitizeString(context.city);
  const checkIn = sanitizeString(context.checkIn);
  const checkOut = sanitizeString(context.checkOut);
  const destinationLabel = sanitizeString(context.destinationLabel);
  const cityName = sanitizeString(context.cityName);
  const adults = sanitizeNumber(context.adults);
  const rooms = sanitizeNumber(context.rooms);
  const children = sanitizeNumber(context.children);
  const sort = sanitizeString(context.sort);
  const filterId = sanitizeString(context.filterId);
  const filterType = sanitizeString(context.filterType);
  const dealId = sanitizeString(context.dealId);
  const dealTitle = sanitizeString(context.dealTitle);
  const source = sanitizeString(context.source);
  const errorMessage = sanitizeString(context.errorMessage);
  const resultCount = sanitizeNumber(context.resultCount);
  const mappedCount = sanitizeNumber(context.mappedCount);
  const provider = context.provider;
  const resultPosition = sanitizeNumber(context.resultPosition);

  if (hotelId) payload.hotelId = hotelId;
  if (city) payload.city = city;
  if (destinationLabel) payload.destinationLabel = destinationLabel;
  if (cityName) payload.cityName = cityName;
  if (checkIn) payload.checkIn = checkIn;
  if (checkOut) payload.checkOut = checkOut;
  if (adults != null) payload.adults = adults;
  if (rooms != null) payload.rooms = rooms;
  if (children != null) payload.children = children;
  if (sort) payload.sort = sort;
  if (filterId) payload.filterId = filterId;
  if (filterType) payload.filterType = filterType;
  if (dealId) payload.dealId = dealId;
  if (dealTitle) payload.dealTitle = dealTitle;
  if (source) payload.source = source;
  if (errorMessage) payload.errorMessage = errorMessage;
  if (resultCount != null) payload.resultCount = resultCount;
  if (mappedCount != null) payload.mappedCount = mappedCount;
  if (provider) payload.provider = provider;
  if (resultPosition != null) payload.resultPosition = resultPosition;

  // Handle polymorphic filterValue
  if (typeof context.filterValue === "string") {
    const filterValue = sanitizeString(context.filterValue);
    if (filterValue) payload.filterValue = filterValue;
  } else if (typeof context.filterValue === "number") {
    const filterValue = sanitizeNumber(context.filterValue);
    if (filterValue != null) payload.filterValue = filterValue;
  } else if (typeof context.filterValue === "boolean") {
    const filterValue = sanitizeBoolean(context.filterValue);
    if (filterValue != null) payload.filterValue = filterValue;
  } else if (Array.isArray(context.filterValue)) {
    const filterValue = sanitizePrimitiveArray(context.filterValue as any);
    if (filterValue) payload.filterValue = filterValue;
  }

  if (context.filters && Object.keys(context.filters).length > 0) {
    payload.filters = context.filters;
  }

  return payload;
}

/**
 * Generic internal tracking function.
 * Ensures PostHog is loaded and handles potential errors gracefully.
 */
function trackHotelEvent(
  eventName: string,
  context: HotelTrackingContext,
): void {
  try {
    const payload = buildHotelTrackingPayload(context);

    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(eventName, payload);
    }
  } catch {
    // Never block user flow on analytics failure.
  }
}

// ─── Search Flow ───────────────────────────────────────────────────

export function trackHotelSearchView(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_search_view", context);
}

export function trackHotelSearchSubmit(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_search_submit", context);
}

export function trackHotelAutocompleteSelect(
  context: HotelTrackingContext,
): void {
  trackHotelEvent("hotel_autocomplete_select", context);
}

export function trackHotelSearchError(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_search_error", context);
}

export function trackHotelNoResults(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_no_results", context);
}

// ─── Results Interaction ───────────────────────────────────────────

export function trackHotelSelect(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_select", context);
}

export function trackHotelMarkerClick(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_marker_click", context);
}

export function trackHotelSortChange(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_sort_change", context);
}

export function trackHotelFilterApply(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_filter_apply", context);
}

export function trackHotelFilterClear(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_filter_clear", context);
}

// ─── Content & Conversion ──────────────────────────────────────────

export function trackHotelDetailView(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_detail_view", context);
}

export function trackHotelBookClick(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_book_click", context);
}

export function trackHotelDealClick(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_deal_click", context);
}

export function trackHotelOutboundRedirectClick(
  context: HotelTrackingContext,
): void {
  trackHotelEvent("hotel_outbound_redirect_click", context);
}
