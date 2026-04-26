interface BuildOutboundDealUrlInput {
  baseUrl?: string | null;
  provider: "agoda" | "booking" | "trip" | "expedia" | "klook";
  hotelId?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  resultPosition?: number;
}

const UTM_PARAMS = {
  utm_source: "gotravelasia",
  utm_medium: "hotel_meta",
  utm_campaign: "hotel_detail",
} as const;

function sanitizeString(value?: string): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function sanitizePosition(value?: number): string | null {
  return Number.isFinite(value) ? String(value) : null;
}

function parseBaseUrl(baseUrl: string): URL | null {
  try {
    return new URL(baseUrl);
  } catch {
    try {
      if (typeof window !== "undefined") {
        return new URL(baseUrl, window.location.origin);
      }
      return null;
    } catch {
      return null;
    }
  }
}

export function buildOutboundDealUrl(input: BuildOutboundDealUrlInput): string | null {
  const baseUrl = sanitizeString(input.baseUrl ?? undefined);
  if (!baseUrl) {
    return null;
  }

  const parsedUrl = parseBaseUrl(baseUrl);
  if (!parsedUrl || (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:")) {
    return null;
  }

  for (const [key, value] of Object.entries(UTM_PARAMS)) {
    if (!parsedUrl.searchParams.has(key)) {
      parsedUrl.searchParams.set(key, value);
    }
  }

  if (!parsedUrl.searchParams.has("partner")) {
    parsedUrl.searchParams.set("partner", input.provider);
  }

  const optionalParams: Record<string, string | null> = {
    hotel_id: sanitizeString(input.hotelId),
    city: sanitizeString(input.city),
    checkin: sanitizeString(input.checkIn),
    checkout: sanitizeString(input.checkOut),
    position: sanitizePosition(input.resultPosition),
    sort: sanitizeString(input.sort),
  };

  for (const [key, value] of Object.entries(optionalParams)) {
    if (value && !parsedUrl.searchParams.has(key)) {
      parsedUrl.searchParams.set(key, value);
    }
  }

  return parsedUrl.toString();
}
