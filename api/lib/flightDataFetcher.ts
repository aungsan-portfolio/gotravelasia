// api/lib/flightDataFetcher.ts
// Unified fetcher: Travelpayouts (primary) → Amadeus (fallback) → static (last resort)
// Feeds into existing normalizeLiveData → mergeDestinationData → buildDestinationPageVM pipeline

import {
  fetchCheapPrices,
  fetchMonthlyPrices,
  fetchLatestPrices,
  fetchCalendarPrices,
  buildAffiliateLink,
  type TpCheapTicket,
  type TpMonthlyEntry,
  type TpLatestPrice,
  type TpCalendarEntry,
} from "./travelpayoutsService";

import {
  searchFlightOffers,
  isAmadeusConfigured,
  type AmFlightOffer,
} from "./amadeusService";

import type { Deal, PriceMonthDatum } from "./destination";


// ── Types ───────────────────────────────────────────────────────────
export type FetchResult<T> = {
  data: T | null;
  source: "travelpayouts" | "amadeus" | "static";
  error?: string;
};


// ── Convert Travelpayouts → Deal[] (month-keyed) ────────────────────
function tpCheapToDeal(
  ticket: TpCheapTicket,
  stops: string,
  origin: string,
  destination: string,
): Deal {
  return {
    from: origin,
    to: destination,
    d1: ticket.departure_at,
    a1: null,
    airline: ticket.airline,
    airlineCode: ticket.airline,
    logoUrl: `https://pics.avs.io/120/120/${ticket.airline}.png`,
    stops: Number(stops),
    duration: "—",
    price: ticket.price,
    bookingUrl: buildAffiliateLink(
      origin,
      destination,
      ticket.departure_at.split("T")[0],
      ticket.return_at?.split("T")[0],
    ),
    found: new Date().toISOString(),
  };
}

function groupDealsByMonth(deals: Deal[]): Record<string, Deal[]> {
  const grouped: Record<string, Deal[]> = {};
  for (const deal of deals) {
    if (!deal.d1) continue;
    const monthKey = deal.d1.slice(0, 7); // "2026-04"
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(deal);
  }
  return grouped;
}


// ── Convert Amadeus → Deal[] ────────────────────────────────────────
function amOfferToDeal(offer: AmFlightOffer, origin: string, destination: string): Deal {
  const seg = offer.itineraries[0]?.segments[0];
  const totalStops = offer.itineraries[0]?.segments
    ? offer.itineraries[0].segments.length - 1
    : 0;
  return {
    from: origin,
    to: destination,
    d1: seg?.departure.at ?? null,
    a1: seg?.arrival.at ?? null,
    airline: offer.validatingAirlineCodes[0] ?? seg?.carrierCode ?? "—",
    airlineCode: offer.validatingAirlineCodes[0] ?? seg?.carrierCode ?? "",
    logoUrl: `https://pics.avs.io/120/120/${offer.validatingAirlineCodes[0] ?? seg?.carrierCode ?? ""}.png`,
    stops: totalStops,
    duration: offer.itineraries[0]?.duration?.replace("PT", "").toLowerCase() ?? "—",
    price: Math.round(parseFloat(offer.price.grandTotal)),
    found: new Date().toISOString(),
  };
}


// ── Convert Travelpayouts monthly → PriceMonthDatum[] ───────────────
function tpMonthlyToPriceMonths(
  data: Record<string, TpMonthlyEntry>,
): PriceMonthDatum[] {
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, entry]) => {
      const monthIndex = parseInt(key.split("-")[1], 10) - 1;
      return {
        month: MONTH_NAMES[monthIndex] ?? key,
        value: entry.price,
      };
    });
}


// ══════════════════════════════════════════════════════════════════════
// PUBLIC FETCHERS
// ══════════════════════════════════════════════════════════════════════

/**
 * Fetch flight deals for a destination page.
 * Strategy: Travelpayouts cheap → Amadeus → null (caller uses static).
 */
export async function fetchFlightDeals(
  origin: string,
  destination: string,
  opts?: { currency?: string },
): Promise<FetchResult<Record<string, Deal[]>>> {
  // ── Try Travelpayouts first ───────────────────────────────────
  try {
    const data = await fetchCheapPrices(origin, destination, {
      currency: opts?.currency ?? "THB",
    });

    if (data && Object.keys(data).length > 0) {
      const deals: Deal[] = [];
      const destData = data[destination] ?? Object.values(data)[0];
      if (destData) {
        for (const [stops, ticket] of Object.entries(destData)) {
          deals.push(tpCheapToDeal(ticket as TpCheapTicket, stops, origin, destination));
        }
      }

      // Also fetch latest prices for more deals
      const latest = await fetchLatestPrices(origin, destination, {
        currency: opts?.currency ?? "THB",
        limit: 20,
      });
      if (latest) {
        for (const lp of latest) {
          deals.push({
            from: lp.origin,
            to: lp.destination,
            d1: lp.depart_date + "T00:00:00Z",
            a1: null,
            airline: "—",
            airlineCode: "",
            logoUrl: "",
            stops: lp.number_of_changes,
            duration: "—",
            price: lp.value,
            bookingUrl: buildAffiliateLink(lp.origin, lp.destination, lp.depart_date, lp.return_date),
            found: lp.found_at,
          });
        }
      }

      if (deals.length > 0) {
        return { data: groupDealsByMonth(deals), source: "travelpayouts" };
      }
    }
  } catch (err) {
    console.error("[FlightDataFetcher] Travelpayouts error:", err);
  }

  // ── Try Amadeus fallback ──────────────────────────────────────
  if (isAmadeusConfigured()) {
    try {
      const departDate = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];
      const offers = await searchFlightOffers(origin, destination, departDate, {
        currencyCode: opts?.currency ?? "THB",
        max: 20,
      });
      if (offers && offers.length > 0) {
        const deals = offers.map((o) => amOfferToDeal(o, origin, destination));
        return { data: groupDealsByMonth(deals), source: "amadeus" };
      }
    } catch (err) {
      console.error("[FlightDataFetcher] Amadeus error:", err);
    }
  }

  // ── Both failed — return null (caller will use static registry) ─
  return { data: null, source: "static", error: "Both APIs unavailable" };
}


/**
 * Fetch monthly price trend for price chart.
 * Strategy: Travelpayouts monthly → static fallback.
 */
export async function fetchMonthlyPriceTrend(
  origin: string,
  destination: string,
  opts?: { currency?: string },
): Promise<FetchResult<PriceMonthDatum[]>> {
  try {
    const data = await fetchMonthlyPrices(origin, destination, {
      currency: opts?.currency ?? "THB",
    });
    if (data && Object.keys(data).length > 0) {
      return { data: tpMonthlyToPriceMonths(data), source: "travelpayouts" };
    }
  } catch (err) {
    console.error("[FlightDataFetcher] Monthly prices error:", err);
  }
  return { data: null, source: "static" };
}


/**
 * Fetch calendar prices for a specific month (daily breakdown).
 */
export async function fetchCalendarForMonth(
  origin: string,
  destination: string,
  month: string, // "2026-04"
  opts?: { currency?: string },
): Promise<FetchResult<Record<string, TpCalendarEntry>>> {
  try {
    const data = await fetchCalendarPrices(origin, destination, month, {
      currency: opts?.currency ?? "THB",
    });
    if (data && Object.keys(data).length > 0) {
      return { data, source: "travelpayouts" };
    }
  } catch (err) {
    console.error("[FlightDataFetcher] Calendar error:", err);
  }
  return { data: null, source: "static" };
}
