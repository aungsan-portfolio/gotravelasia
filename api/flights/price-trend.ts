import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/http.js";
import { validatePriceTrendRequest } from "../../shared/flights/priceIntelligence.validation.js";
import { getPriceTrend } from "../_lib/price-intelligence/trendService.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: { code: "BAD_REQUEST", message: "Method not allowed" } });
    return;
  }

  const validation = validatePriceTrendRequest(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: validation.message } });
    return;
  }

  try {
    const data = await getPriceTrend(validation.data);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(data);
  } catch (error) {
    console.error("price-trend route error", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch price trend" } });
  }
}
