import path from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const cwd = process.cwd();
    // In Vercel Node runtime, cwd is usually `/var/task`
    // The client code is typically at `/var/task/client/src/...` if not tree-shaken by esbuild
    
    let destinationRegistry;
    let buildDestinationPageVMMod;
    let flightDataFetcher;

    try {
      destinationRegistry = await import(path.join(cwd, "client/src/data/destinationRegistry.ts"));
      buildDestinationPageVMMod = await import(path.join(cwd, "client/src/lib/destination/buildDestinationPageVM.ts"));
      flightDataFetcher = await import(path.join(cwd, "client/src/lib/api/flightDataFetcher.ts"));
    } catch (err) {
      // Fallback: maybe it's compiled to .js?
      destinationRegistry = await import(path.join(cwd, "client/src/data/destinationRegistry.js"));
      buildDestinationPageVMMod = await import(path.join(cwd, "client/src/lib/destination/buildDestinationPageVM.js"));
      flightDataFetcher = await import(path.join(cwd, "client/src/lib/api/flightDataFetcher.js"));
    }

    const { getDestinationBySlug, getDestinationByCode } = destinationRegistry;
    const { buildDestinationPageVM } = buildDestinationPageVMMod;
    const { fetchFlightDeals, fetchMonthlyPriceTrend } = flightDataFetcher;

    const slug        = String(req.query.slug        || "");
    const destination = String(req.query.destination || "").toUpperCase();

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

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(vm);

  } catch (error) {
    return res.status(500).json({
      error: "Runtime module resolution error",
      details: error instanceof Error ? error.message : String(error),
      cwd: process.cwd()
    });
  }
}
