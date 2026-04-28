import type { Request, Response } from "express";

import { getHotelCities } from "../../shared/hotels/cities.js";

const AGODA_UNIFIED_SUGGEST_URL =
  "https://affiliateapi7643.agoda.com/api/v1/UnifiedSuggest";
const AGODA_TIMEOUT_MS = 2500;
const AGODA_API_KEY = process.env.AGODA_API_KEY ?? "";

type AutocompleteSuggestion = {
  displayName: string;
  locationType: "city";
  locationId: string;
  subtitle?: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toStringIfPresent(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function parseAgodaCitySuggestions(payload: unknown): AutocompleteSuggestion[] {
  const collectableCandidates: unknown[] = [];

  if (Array.isArray(payload)) {
    collectableCandidates.push(...payload);
  } else if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const buckets = [
      root.suggestions,
      root.data,
      (root.data as Record<string, unknown> | undefined)?.suggestions,
      (root.result as Record<string, unknown> | undefined)?.items,
      root.results,
      root.items,
    ];

    for (const bucket of buckets) {
      if (Array.isArray(bucket)) {
        collectableCandidates.push(...bucket);
      }
    }
  }

  const suggestions: AutocompleteSuggestion[] = [];

  for (const candidate of collectableCandidates) {
    if (!candidate || typeof candidate !== "object") continue;

    const row = candidate as Record<string, unknown>;
    const typeRaw = toStringIfPresent(
      row.type ?? row.locationType ?? row.objectType ?? row.category
    )?.toLowerCase();

    // Allow city-like records only.
    if (typeRaw && !typeRaw.includes("city")) continue;

    const cityId = toStringIfPresent(
      row.cityId ?? row.city_id ?? row.id ?? row.locationId ?? row.objectId
    );
    const cityName = toStringIfPresent(
      row.cityName ?? row.name ?? row.displayName ?? row.label ?? row.title
    );

    if (!cityId || !cityName) continue;

    const subtitle = [
      toStringIfPresent(row.countryName ?? row.country ?? row.countryCode),
      toStringIfPresent(row.regionName ?? row.region ?? row.state),
    ]
      .filter(Boolean)
      .join(" • ");

    suggestions.push({
      displayName: cityName,
      locationType: "city",
      locationId: cityId,
      subtitle: subtitle || undefined,
    });
  }

  return suggestions.slice(0, 10);
}

function fallbackLocalSuggestions(q: string): AutocompleteSuggestion[] {
  return getHotelCities()
    .filter(city => {
      const haystacks = [
        city.name,
        city.nameMM,
        city.country,
        city.bookingName,
        city.slug,
        city.iata,
      ].map(normalize);

      return haystacks.some(value => value.includes(normalize(q)));
    })
    .slice(0, 10)
    .map(city => ({
      displayName: city.name,
      locationType: "city",
      locationId: String(city.agodaCityId),
      subtitle: `${city.country} • ${city.iata}`,
    }));
}

async function fetchAgodaSuggestions(
  query: string
): Promise<AutocompleteSuggestion[]> {
  if (!AGODA_API_KEY) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AGODA_TIMEOUT_MS);

  try {
    const response = await fetch(AGODA_UNIFIED_SUGGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AGODA_API_KEY,
      },
      body: JSON.stringify({
        keyword: query,
        query,
        language: "en-us",
        limit: 10,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as unknown;
    return parseAgodaCitySuggestions(payload);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchAutocompleteHotels(req: Request, res: Response) {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.json({ suggestions: [] });
  }

  const agodaSuggestions = await fetchAgodaSuggestions(q);
  if (agodaSuggestions.length > 0) {
    return res.json({ suggestions: agodaSuggestions });
  }

  return res.json({ suggestions: fallbackLocalSuggestions(q) });
}

export const __autocompleteTestables = {
  parseAgodaCitySuggestions,
  fallbackLocalSuggestions,
};
