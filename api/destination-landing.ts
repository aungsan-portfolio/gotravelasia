import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug, getDestinationByCode } from "../client/src/data/destinationRegistry";
// import { buildDestinationPageVM } from "../client/src/lib/destination/buildDestinationPageVM";
// import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../client/src/lib/api/flightDataFetcher";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug || "bangkok");
  
  try {
     const record = getDestinationBySlug(slug);
     return res.status(200).json({ 
       msg: "Step 1: destinationRegistry works", 
       slug, 
       found: !!record,
       city: record?.dest.city
     });
  } catch (err) {
     return res.status(500).json({ error: "Catchable error", msg: String(err) });
  }
}
