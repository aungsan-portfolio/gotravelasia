// api/flights.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors, parseRequest } from "./_lib/http";
import { handleCalendarPrices } from "./_lib/calendarPrices";
import { handleCheapPrices }    from "./_lib/cheapPrices";
import { handleSpecialOffers }  from "./_lib/specialOffers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const params = parseRequest(req);
  const { type } = params;

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  switch (type) {
    case "calendar":
      return handleCalendarPrices(req, res, params);
    case "cheap":
      return handleCheapPrices(req, res, params);
    case "special-offers":
      return handleSpecialOffers(req, res, params);
    default:
      return res.status(400).json({
        error: "Invalid type",
        valid: ["calendar", "cheap", "special-offers"],
      });
  }
}
