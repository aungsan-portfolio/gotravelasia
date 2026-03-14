import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug, getDestinationByCode } from "../client/src/data/destinationRegistry";
import { buildDestinationPageVM } from "../client/src/lib/destination/buildDestinationPageVM";
import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../client/src/lib/api/flightDataFetcher";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug        = String(req.query.slug        || "");
  const destination = String(req.query.destination || "").toUpperCase();

  console.log("[DL start]", {
    slug,
    destination,
    envToken: !!(process.env.VITE_TRAVELPAYOUTS_API_TOKEN || process.env.TRAVELPAYOUTS_API_TOKEN || process.env.TRAVELPAYOUTS_TOKEN),
    envMarker: !!(process.env.VITE_TRAVELPAYOUTS_MARKER || process.env.TRAVELPAYOUTS_MARKER),
    envAmadeusId: !!(process.env.VITE_AMADEUS_CLIENT_ID || process.env.AMADEUS_CLIENT_ID),
  });

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
    console.error("[DL error] Static record not found for slug:", targetSlug);
    return res.status(404).json({ error: `Destination not found: ${targetSlug}` });
  }

  try {
    // BKK→BKK guard
    const originCode = staticRecord.origin.code;
    const destCode   = staticRecord.dest.code;
    
    console.log("[DL processing]", { originCode, destCode });

    const safeOrigin = originCode === destCode
      ? { city: "Chiang Mai", code: "CNX", country: "Thailand" }
      : staticRecord.origin;

    console.log("[DL fetching live data]", { safeOriginCode: safeOrigin.code });

    const [dealsResult, monthlyResult] = await Promise.all([
      fetchFlightDeals(safeOrigin.code, destCode),
      fetchMonthlyPriceTrend(safeOrigin.code, destCode),
    ]);

    console.log("[DL fetch results]", { 
      dealsSource: dealsResult.source, 
      monthlySource: monthlyResult.source 
    });

    const mergedRecord = {
      ...staticRecord,
      origin: safeOrigin,
      ...(dealsResult.data   ? { deals:       dealsResult.data   } : {}),
      ...(monthlyResult.data ? { priceMonths: monthlyResult.data } : {}),
    };

    const liveState =
      dealsResult.source === "travelpayouts" ||
      dealsResult.source === "amadeus" ? "live" : "static";

    const vm = buildDestinationPageVM(mergedRecord, {
      liveState,
      lastUpdated: new Date().toISOString(),
      sourceLabel: liveState === "live" ? "Travelpayouts API" : "Static registry",
    });

    console.log("[DL success] Returning VM for:", targetSlug);
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(vm);

  } catch (error) {
    console.error("[DL fatal error]:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
