import posthog from "posthog-js";

export interface HotelTrackingContext {
  hotelId?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  filters?: Record<string, unknown>;
  resultPosition?: number;
  provider?: "agoda" | "booking" | "trip" | "expedia" | "klook";
}

function sanitizeString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function sanitizeNumber(value?: number): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

export function buildHotelTrackingPayload(context: HotelTrackingContext): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const hotelId = sanitizeString(context.hotelId);
  const city = sanitizeString(context.city);
  const checkIn = sanitizeString(context.checkIn);
  const checkOut = sanitizeString(context.checkOut);
  const sort = sanitizeString(context.sort);
  const provider = context.provider;
  const resultPosition = sanitizeNumber(context.resultPosition);

  if (hotelId) payload.hotelId = hotelId;
  if (city) payload.city = city;
  if (checkIn) payload.checkIn = checkIn;
  if (checkOut) payload.checkOut = checkOut;
  if (sort) payload.sort = sort;
  if (provider) payload.provider = provider;
  if (resultPosition != null) payload.resultPosition = resultPosition;
  if (context.filters && Object.keys(context.filters).length > 0) {
    payload.filters = context.filters;
  }

  return payload;
}

function trackHotelEvent(eventName: string, context: HotelTrackingContext): void {
  try {
    const payload = buildHotelTrackingPayload(context);

    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(eventName, payload);
    }
  } catch {
    // Never block user flow on analytics failure.
  }
}

export function trackHotelSearchView(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_search_view", context);
}

export function trackHotelSelect(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_select", context);
}

export function trackHotelMarkerClick(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_marker_click", context);
}

export function trackHotelDetailView(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_detail_view", context);
}

export function trackHotelBookClick(context: HotelTrackingContext): void {
  trackHotelEvent("hotel_book_click", context);
}
