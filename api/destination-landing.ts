import type { VercelRequest, VercelResponse } from "@vercel/node";

// ── In-memory cache ─────────────────────────────────────────────
type CacheEntry = {
  expiresAt: number;
  payload: unknown;
};

const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000; // 30 min

function getCacheKey(origin: string, destination: string, currency: string) {
  return `${origin}:${destination}:${currency}`;
}

// ── Aviasales deep-link builder ─────────────────────────────────
function buildBookingUrl(args: {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
}) {
  const base = new URL("https://www.aviasales.com/search");
  const depart = args.departDate
    ? args.departDate.slice(0, 10).replaceAll("-", "")
    : "";
  const ret = args.returnDate
    ? args.returnDate.slice(0, 10).replaceAll("-", "")
    : "";
  const route = ret
    ? `${args.origin}${depart}${args.destination}${ret}1`
    : `${args.origin}${depart}${args.destination}1`;

  base.pathname = `/search/${route}`;
  return base.toString();
}

// ── Travelpayouts v1/prices/cheap response shape ────────────────
// Response: { success: true, data: { "SIN": { "0": {...}, "1": {...} } } }
type RawCheapPriceItem = {
  airline?: string;
  departure_at?: string;
  expires_at?: string;
  flight_number?: number;
  price?: number;
  return_at?: string;
  transfers?: number;
  duration?: number;
};

/**
 * Safely extracts fare items from the nested Travelpayouts response.
 * raw.data[destination] → { "0": item, "1": item, ... }
 */
function extractFareItems(
  raw: any,
  destination: string,
): RawCheapPriceItem[] {
  if (!raw || typeof raw !== "object") return [];

  const data = raw.data;
  if (!data || typeof data !== "object") return [];

  const destinationBucket = data[destination];
  if (!destinationBucket || typeof destinationBucket !== "object") return [];

  return Object.values(destinationBucket).filter(
    (item): item is RawCheapPriceItem =>
      !!item && typeof item === "object",
  );
}

// ── Handler ─────────────────────────────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const origin = String(req.query.origin || "").toUpperCase();
  const destination = String(req.query.destination || "").toUpperCase();
  const currency = String(req.query.currency || "thb").toLowerCase();

  if (!origin || !destination) {
    return res
      .status(400)
      .json({ error: "origin and destination are required" });
  }

  // ── Cache hit ───────────────────────────────────────────────
  const cacheKey = getCacheKey(origin, destination, currency);
  const cached = CACHE.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=3600",
    );
    return res.status(200).json(cached.payload);
  }

  // ── Fetch from Travelpayouts ────────────────────────────────
  try {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) {
      throw new Error("Missing TRAVELPAYOUTS_TOKEN");
    }

    const url = new URL("https://api.travelpayouts.com/v1/prices/cheap");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("currency", currency);

    const response = await fetch(url.toString(), {
      headers: { "X-Access-Token": token },
    });

    if (!response.ok) {
      throw new Error(`Travelpayouts request failed: ${response.status}`);
    }

    const raw = await response.json();
    const fareItems = extractFareItems(raw, destination);

    // ── Map raw items to our FareTableEntry shape ─────────────
    const fareTable = fareItems.slice(0, 12).map((item) => ({
      from1: origin,
      to1: destination,
      d1: item.departure_at ?? new Date().toISOString(),
      a1: null,
      s1: item.transfers ?? 0,
      dur1: item.duration
        ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`
        : null,

      // Return leg — populated when return_at exists
      from2: item.return_at ? destination : null,
      to2: item.return_at ? origin : null,
      d2: item.return_at ?? null,
      a2: null,
      s2: item.return_at ? (item.transfers ?? null) : null,
      dur2: null,

      airline: item.airline ?? "Unknown Airline",
      airlineCode: item.airline ?? undefined,
      logoUrl: item.airline
        ? `https://pics.avs.io/200/200/${item.airline}.png`
        : undefined,
      bookingUrl: buildBookingUrl({
        origin,
        destination,
        departDate: item.departure_at,
        returnDate: item.return_at,
      }),
      price: Number(item.price ?? 0),
    }));

    // ── Aggregate airline summary from fare rows ──────────────
    const airlineMap = new Map<
      string,
      { code: string; name: string; logoUrl?: string; dealCount: number }
    >();
    for (const row of fareTable) {
      const key = row.airlineCode ?? row.airline;
      const existing = airlineMap.get(key);
      if (existing) {
        existing.dealCount += 1;
      } else {
        airlineMap.set(key, {
          code: row.airlineCode ?? row.airline,
          name: row.airline,
          logoUrl: row.logoUrl,
          dealCount: 1,
        });
      }
    }

    // ── Build response payload ────────────────────────────────
    const payload = {
      meta: {
        origin,
        destination,
        currency,
        updatedAt: new Date().toISOString(),
      },
      deals: {
        cheapest: fareTable.slice(0, 3).map((row) => ({
          from: row.from1,
          to: row.to1,
          d1: row.d1,
          a1: row.a1,
          airline: row.airline,
          airlineCode: row.airlineCode,
          logoUrl: row.logoUrl,
          bookingUrl: row.bookingUrl,
          stops: row.s1,
          duration: row.dur1 ?? "—",
          price: row.price,
          tag: "Budget",
        })),
        fastest: [],
        bestValue: [],
        weekend: [],
        premium: [],
      },
      fareTable,
      airlines: Array.from(airlineMap.values()),
    };

    CACHE.set(cacheKey, {
      expiresAt: Date.now() + TTL_MS,
      payload,
    });

    res.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=3600",
    );
    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);

    // Intentional 200: return empty live payload so client keeps
    // rendering static fallback data without triggering error UI.
    return res.status(200).json({
      meta: {
        origin,
        destination,
        currency,
        updatedAt: new Date().toISOString(),
      },
      deals: {
        cheapest: [],
        fastest: [],
        bestValue: [],
        weekend: [],
        premium: [],
      },
      fareTable: [],
      airlines: [],
    });
  }
}
