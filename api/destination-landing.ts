import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug, getDestinationByCode } from "./lib/destinationRegistry";
import { buildDestinationPageVM } from "./lib/buildDestinationPageVM";
import { fetchFlightDeals, fetchMonthlyPriceTrend } from "./lib/flightDataFetcher";

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

    const [dealsResult, monthlyResult] = await Promise.all([
      fetchFlightDeals(safeOrigin.code, destCode),
      fetchMonthlyPriceTrend(safeOrigin.code, destCode),
    ]);

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
    console.error("[DL dynamic fatal error]:", error);
    return res.status(500).json({
      error: "Runtime import error",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
