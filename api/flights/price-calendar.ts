import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/http.js";
import { validatePriceCalendarRequest } from "../../shared/flights/priceIntelligence.validation.js";
import { getPriceCalendar } from "../_lib/price-intelligence/calendarService.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: { code: "BAD_REQUEST", message: "Method not allowed" } });
    return;
  }

  const validation = validatePriceCalendarRequest(req.query as Record<string, unknown>);
  if (!validation.ok) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: validation.message } });
    return;
  }

  try {
    const data = await getPriceCalendar(validation.data);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(data);
  } catch (error) {
    console.error("price-calendar route error", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch price calendar" } });
  }
}
