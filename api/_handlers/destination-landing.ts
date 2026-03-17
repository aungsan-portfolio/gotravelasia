import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug, getDestinationByCode, getDestinationsByCountrySlug } from "../_lib/destinationRegistry.js";
import { buildDestinationPageVM } from "../_lib/buildDestinationPageVM.js";
import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../_lib/flightDataFetcher.js";

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
    const destinations = isCountry 
      ? getDestinationsByCountrySlug(staticRecord.dest.country ?? "")
      : [staticRecord];

    // Fetch deals for all airports if country, or single airport if city
    const [dealsResults, monthlyResult] = await Promise.all([
      Promise.all(destinations.map((d: any) => fetchFlightDeals(safeOrigin.code, d.dest.code))),
      fetchMonthlyPriceTrend(safeOrigin.code, destCode),
    ]);

    // Flatten and merge deals from all airports
    const allDeals: Record<string, any[]> = {};
    let isLive = false;

    dealsResults.forEach((res: any) => {
      if (res.source === "travelpayouts" || res.source === "amadeus") isLive = true;
      if (res.data) {
        Object.entries(res.data).forEach(([month, deals]) => {
          allDeals[month] = [...(allDeals[month] || []), ...(deals as any[])];
        });
      }
    });

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
