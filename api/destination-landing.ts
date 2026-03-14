import type { VercelRequest, VercelResponse } from "@vercel/node";
// import { getDestinationBySlug, getDestinationByCode } from "../client/src/data/destinationRegistry";
// import { buildDestinationPageVM } from "../client/src/lib/destination/buildDestinationPageVM";
// import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../client/src/lib/api/flightDataFetcher";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug || "");
  console.log("[DL Debug Barebones] Slug:", slug);
  
  try {
     const staticRecord = getDestinationBySlug(slug);
     return res.status(200).json({ 
       msg: "Imports worked", 
       slug, 
       found: !!staticRecord,
       node: process.version 
     });
  } catch (err) {
     return res.status(500).json({ error: "Catchable error", msg: String(err) });
  }
}
