import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug, getDestinationByCode, getDestinationsByCountrySlug } from "../_lib/destinationRegistry.js";
import { buildDestinationPageVM } from "../_lib/buildDestinationPageVM.js";
import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../_lib/flightDataFetcher.js";
import type { Deal } from "../_lib/destination.js";

const COUNTRY_MAJOR_AIRPORTS: Record<string, string[]> = {
  vietnam: ["HAN", "SGN", "DAD"],
  thailand: ["BKK", "CNX", "HKT", "KBV"],
  japan: ["NRT", "HND", "OSA", "KIX"],
  indonesia: ["CGK", "DPS"],
  malaysia: ["KUL", "PEN"],
  cambodia: ["PNH", "SAI"],
  laos: ["VTE", "LPQ"],
  philippines: ["MNL", "CEB"],
  "south-korea": ["ICN", "GMP"],
  taiwan: ["TPE", "KHH"],
  china: ["PEK", "PVG", "CAN", "CTU", "SZX"],
  "hong-kong": ["HKG"],
  singapore: ["SIN"],
  macau: ["MFM"],
  brunei: ["BWN"],
  india: ["BOM", "DEL"],
  "united-arab-emirates": ["DXB", "AUH"],
};

function dedupeAndSortDealsByPrice(deals: Deal[]): Deal[] {
  const deduped = new Map<string, Deal>();
  for (const deal of deals) {
    const key = [deal.airline, `${deal.from}-${deal.to}`, deal.d1, deal.price].join("|");
    if (!deduped.has(key)) deduped.set(key, deal);
  }

  return Array.from(deduped.values()).sort((a, b) => a.price - b.price);
}

function mergeCountryDealsByMonth(fetchResults: Array<{ data: Record<string, Deal[]> | null }>): Record<string, Deal[]> {
  const merged: Record<string, Deal[]> = {};

  for (const result of fetchResults) {
    if (!result.data) continue;
    for (const [month, deals] of Object.entries(result.data)) {
      merged[month] = [...(merged[month] ?? []), ...deals];
    }
  }

  for (const month of Object.keys(merged)) {
    merged[month] = dedupeAndSortDealsByPrice(merged[month]);
  }

  return merged;
}

async function fetchCountryDeals(originCode: string, countrySlug: string): Promise<{
  deals: Record<string, Deal[]>;
  isLive: boolean;
}> {
  const airports = COUNTRY_MAJOR_AIRPORTS[countrySlug] ?? [];
  if (!airports.length) return { deals: {}, isLive: false };

  const settled = await Promise.allSettled(
    airports.map((airportCode) => fetchFlightDeals(originCode, airportCode)),
  );

  const successfulResults: Array<{ data: Record<string, Deal[]> | null; source?: string }> = [];
  let isLive = false;

  for (const result of settled) {
    if (result.status !== "fulfilled") {
      console.warn("[DL country fetch failed]", result.reason);
      continue;
    }

    successfulResults.push(result.value);
    if (result.value.source === "travelpayouts" || result.value.source === "amadeus") {
      isLive = true;
    }
  }

  return {
    deals: mergeCountryDealsByMonth(successfulResults),
    isLive,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug        = String(req.query.slug        || "");
  const destination = String(req.query.destination || "").toUpperCase();

  console.log("[DL start dynamic]", { slug, destination });

  try {
    let targetSlug = slug;
    if (!targetSlug && destination) {
      const record = getDestinationByCode(destination);
      if (record) targetSlug = record.slug;
    }
    if (!targetSlug) {
      return res.status(400).json({ error: "slug or destination code is required" });
    }

    const staticRecord = getDestinationBySlug(targetSlug);
    if (!staticRecord) {
      return res.status(404).json({ error: `Destination not found: ${targetSlug}` });
    }

    // BKK→BKK guard
    const originCode = staticRecord.origin.code;
    const destCode   = staticRecord.dest.code;
    const safeOrigin = originCode === destCode
      ? { city: "Chiang Mai", code: "CNX", country: "Thailand" }
      : staticRecord.origin;

    const isCountry = staticRecord.type === "country";
    const [countryCities, monthlyResult] = await Promise.all([
      isCountry
        ? fetchCountryDeals(safeOrigin.code, staticRecord.slug)
        : Promise.resolve({ deals: {}, isLive: false }),
      fetchMonthlyPriceTrend(safeOrigin.code, destCode),
    ]);

    let allDeals: Record<string, Deal[]> = countryCities.deals;
    let isLive = countryCities.isLive;

    // Keep city-page behavior unchanged (single destination fetch, no cross-airport merge)
    if (!isCountry) {
      const singleResult = await fetchFlightDeals(safeOrigin.code, destCode);
      if (singleResult.source === "travelpayouts" || singleResult.source === "amadeus") isLive = true;
      allDeals = (singleResult.data as Record<string, Deal[]>) ?? {};
    }

    // Keep country city list hydration behavior unchanged by touching existing helper
    if (isCountry) getDestinationsByCountrySlug(staticRecord.dest.country ?? "");

    const mergedRecord = {
      ...staticRecord,
      origin: safeOrigin,
      deals: Object.keys(allDeals).length > 0 ? allDeals : staticRecord.deals,
      ...(monthlyResult.data ? { priceMonths: monthlyResult.data } : {}),
    };

    const liveState = isLive ? "live" : "static";

    const vm = buildDestinationPageVM(mergedRecord, {
      liveState,
      lastUpdated: new Date().toISOString(),
      sourceLabel: liveState === "live" ? "Travelpayouts API" : "Static registry",
    });

    console.log("[DL success] Returning VM for:", targetSlug);
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(vm);

  } catch (error) {
    console.error("[DL dynamic fatal error]:", error);
    return res.status(500).json({
      error: "Runtime import error",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
