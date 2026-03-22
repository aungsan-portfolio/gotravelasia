/**
 * server/api/hotels.ts
 * Step 4 — Hotels Integration
 * Express controller: Agoda search + AWIN Booking.com + affiliate links
 */
import type { Request, Response } from 'express';
import { getCityBySlug }          from '../../client/src/lib/cities';

// ── Env ──────────────────────────────────────────────────────────
const AGODA_SITE_ID = process.env.AGODA_SITE_ID  ?? '';
const AGODA_API_KEY = process.env.AGODA_API_KEY  ?? '';
const AWIN_TOKEN    = process.env.AWIN_TOKEN     ?? '';
const AWIN_PUB_ID   = process.env.AWIN_PUBLISHER_ID ?? '';
const BOOKING_ADV   = process.env.BOOKING_AWIN_ADV_ID ?? '5910';
const TRIP_SITE_ID  = process.env.TRIP_COM_SITE_ID  ?? '';
const KLOOK_ID      = process.env.KLOOK_PARTNER_ID  ?? '';
const EXPEDIA_CODE  = process.env.EXPEDIA_TP_CODE   ?? 'ZZxDEika';

// ── Simple in-memory cache ────────────────────────────────────────
const cache = new Map<string, { val: unknown; exp: number }>();
async function cached<T>(key: string, fn: () => Promise<T>, ttl: number): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.val as T;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttl * 1000 });
  return val;
}

// ── Helper: offset date ───────────────────────────────────────────
const offsetDate = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];

// ── URL builders ──────────────────────────────────────────────────
function agodaUrl(city: ReturnType<typeof getCityBySlug>, ci: string, co: string, adults: number, rooms: number) {
  const p = new URLSearchParams({ city: String(city!.agodaCityId), checkIn: ci, checkOut: co, rooms: String(rooms), adults: String(adults), cid: AGODA_SITE_ID });
  return `https://www.agoda.com/search?${p}`;
}
function bookingUrl(city: ReturnType<typeof getCityBySlug>, ci: string, co: string, adults: number, rooms: number) {
  const p = new URLSearchParams({ ss: city!.bookingName, checkin: ci, checkout: co, group_adults: String(adults), no_rooms: String(rooms) });
  return `https://www.booking.com/searchresults.html?${p}`;
}
function tripUrl(city: ReturnType<typeof getCityBySlug>, ci: string, co: string, adults: number) {
  const dest = `https://www.trip.com/hotels/list?city=${encodeURIComponent(city!.name)}&checkIn=${ci}&checkOut=${co}&adult=${adults}`;
  return TRIP_SITE_ID
    ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(dest)}`
    : dest;
}
function klookUrl(city: ReturnType<typeof getCityBySlug>, ci: string, co: string, adults: number) {
  const p = new URLSearchParams({ city: city!.name, checkin: ci, checkout: co, adults: String(adults), aid: KLOOK_ID });
  return `https://www.klook.com/hotels/search/?${p}`;
}
function expediaUrl(city: ReturnType<typeof getCityBySlug>, ci: string, co: string, adults: number) {
  const dest = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(city!.bookingName)}&startDate=${ci}&endDate=${co}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(dest)}`;
}

// ── AWIN deep link ────────────────────────────────────────────────
async function awinDeepLink(destinationUrl: string): Promise<string> {
  const key = `awin:${Buffer.from(destinationUrl).toString('base64').slice(0, 60)}`;
  return cached(key, async () => {
    if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
    try {
      const res = await fetch(
        `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${AWIN_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ advertiserId: parseInt(BOOKING_ADV), destinationUrl }),
        }
      );
      const data = await res.json() as { url?: string };
      return data.url ?? destinationUrl;
    } catch {
      return destinationUrl;
    }
  }, 86400);
}

// ── Agoda hotel search ────────────────────────────────────────────
async function fetchAgodaHotels(agodaCityId: number, ci: string, co: string, adults: number, rooms: number, page: number) {
  const key = `agoda:${agodaCityId}:${ci}:${co}:${adults}:${rooms}:${page}`;
  return cached(key, async () => {
    if (!AGODA_SITE_ID || !AGODA_API_KEY) return getMockHotels(agodaCityId);
    try {
      const body = {
        criteria: { checkInDate: ci, checkOutDate: co, cityId: agodaCityId, numberOfAdult: adults, numberOfRoom: rooms, pageNo: page, pageSize: 20, sortBy: 'rank', additional: { currency: 'USD', language: 'en-us', discountOnly: false } },
        publisherId: AGODA_SITE_ID,
      };
      const res  = await fetch('https://affiliateapi7643.agoda.com/api/v3/json/Search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) return getMockHotels(agodaCityId);
      const json = await res.json() as { results?: { hotels?: unknown[] } };
      return json.results?.hotels ?? getMockHotels(agodaCityId);
    } catch {
      return getMockHotels(agodaCityId);
    }
  }, 1800);
}

// ── Mock data (dev / no API key) ──────────────────────────────────
function getMockHotels(cityId: number) {
  return [
    { hotelId:`${cityId}-1`, name:'Grand Palace Hotel',    stars:5, reviewScore:9.1, reviewCount:2341, address:'City Center',      imageUrl:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities:['Pool','Spa','WiFi','Gym'],        lowestRate:120 },
    { hotelId:`${cityId}-2`, name:'Central Riverside',     stars:4, reviewScore:8.7, reviewCount:1654, address:'Riverside District',imageUrl:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', amenities:['Pool','Restaurant','WiFi'],       lowestRate:78  },
    { hotelId:`${cityId}-3`, name:'Ibis Budget City',      stars:3, reviewScore:8.2, reviewCount:4102, address:'Airport Road',     imageUrl:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', amenities:['Restaurant','WiFi'],              lowestRate:35  },
    { hotelId:`${cityId}-4`, name:'Luxury Boutique Inn',   stars:5, reviewScore:9.4, reviewCount:876,  address:'Old Town',         imageUrl:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', amenities:['Spa','Bar','WiFi','Pool'],        lowestRate:185 },
    { hotelId:`${cityId}-5`, name:'The Standard Hotel',    stars:4, reviewScore:8.9, reviewCount:1234, address:'Downtown',         imageUrl:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', amenities:['Rooftop','Bar','WiFi'],           lowestRate:95  },
    { hotelId:`${cityId}-6`, name:'Heritage Garden Hotel', stars:3, reviewScore:7.8, reviewCount:987,  address:'Heritage Quarter',  imageUrl:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600', amenities:['Garden','WiFi','Breakfast'],     lowestRate:42  },
  ];
}

// ── Route handler ─────────────────────────────────────────────────
export async function searchHotels(req: Request, res: Response) {
  const { city, checkIn, checkOut, adults = '2', rooms = '1', page = '1' } = req.query as Record<string, string>;

  if (!city) return res.status(400).json({ error: 'city param required' });

  const cityData = getCityBySlug(city);
  if (!cityData)           return res.status(404).json({ error: `City not found: ${city}` });
  if (!cityData.hasHotels) return res.status(400).json({ error: `No hotels for ${cityData.name}` });

  const ci = checkIn  || offsetDate(1);
  const co = checkOut || offsetDate(4);
  const ad = parseInt(adults);
  const rm = parseInt(rooms);
  const pg = parseInt(page);

  try {
    const [hotels, bookingLink] = await Promise.all([
      fetchAgodaHotels(cityData.agodaCityId, ci, co, ad, rm, pg),
      awinDeepLink(bookingUrl(cityData, ci, co, ad, rm)),
    ]);

    return res.json({
      city: cityData,
      hotels,
      affiliateLinks: {
        agoda:   agodaUrl(cityData, ci, co, ad, rm),
        booking: bookingLink,
        trip:    tripUrl(cityData,  ci, co, ad),
        klook:   klookUrl(cityData, ci, co, ad),
        expedia: expediaUrl(cityData, ci, co, ad),
      },
      meta: { checkIn: ci, checkOut: co, adults: ad, rooms: rm, page: pg },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Search failed', detail: msg });
  }
}
