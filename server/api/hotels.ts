import { Request, Response } from 'express';
import { getCityBySlug } from '../../client/src/lib/cities';

// ── Cache TTL constants ───────────────────────────────────────────
const TTL = { LINK: 86400, HOTELS: 1800 };
const mem = new Map<string, { val: any; exp: number }>();

async function cached(key: string, fn: () => Promise<any>, ttl: number) {
  const e = mem.get(key);
  if (e && Date.now() < e.exp) return e.val;
  const val = await fn();
  mem.set(key, { val, exp: Date.now() + ttl * 1000 });
  return val;
}

const AGODA_SITE_ID = process.env.AGODA_SITE_ID || '18056'; // Default from user snippet
const AGODA_API_KEY = process.env.AGODA_API_KEY || '';
const AWIN_TOKEN    = process.env.AWIN_TOKEN || '';
const AWIN_PUB_ID   = process.env.AWIN_PUBLISHER_ID || '';
const BOOKING_ADV   = process.env.BOOKING_AWIN_ADV_ID || '5910';
const TRIP_SITE_ID  = process.env.TRIP_COM_SITE_ID || '';

export async function hotelSearchHandler(req: Request, res: Response) {
  const { city, checkIn, checkOut, adults = '2', rooms = '1', page = '1' } = req.query as any;

  const cityData = getCityBySlug(city);
  if (!cityData)          return res.status(404).json({ error: `City not found: ${city}` });
  if (!cityData.hasHotels) return res.status(400).json({ error: `No hotel data for ${cityData.name}` });

  const ci = checkIn  || offset(1);
  const co = checkOut || offset(4);
  const ad = parseInt(adults);
  const rm = parseInt(rooms);

  try {
    // ── 1. Agoda hotels ─────────────────────────────
    const hotels = await fetchAgodaHotels({
      cityId: cityData.agodaCityId,
      checkIn: ci, checkOut: co,
      adults: ad, rooms: rm,
      page: parseInt(page),
    });

    // ── 2. Affiliate links for this city ────────────
    const bookingUrl = buildBookingUrl(cityData, ci, co, ad, rm);
    const bookingLink = await getCachedAwinLink(bookingUrl);

    const affiliateLinks = {
      agoda:   buildAgodaUrl(cityData, ci, co, ad, rm),
      booking: bookingLink || bookingUrl,
      trip:    buildTripUrl(cityData, ci, co, ad),
      klook:   buildKlookUrl(cityData, ci, co, ad),
      expedia: buildExpediaUrl(cityData, ci, co, ad),
    };

    return res.status(200).json({
      city: cityData,
      hotels: hotels || [],
      affiliateLinks,
      meta: { checkIn: ci, checkOut: co, adults: ad, rooms: rm, page: parseInt(page) },
    });
  } catch (err: any) {
    console.error('[hotels/search]', err.message);
    return res.status(500).json({ error: 'Search failed', detail: err.message });
  }
}

// ── Agoda API ─────────────────────────────────────────────────────
async function fetchAgodaHotels({ cityId, checkIn, checkOut, adults, rooms, page }: any) {
  const cacheKey = `agoda:h:${cityId}:${checkIn}:${checkOut}:${adults}:${rooms}:${page}`;
  return cached(cacheKey, async () => {
    if (!AGODA_SITE_ID || !AGODA_API_KEY) return getMockHotels(cityId);
    const body = {
      criteria: {
        checkInDate: checkIn, checkOutDate: checkOut,
        cityId, numberOfAdult: adults, numberOfRoom: rooms,
        pageNo: page, pageSize: 20, sortBy: 'rank',
        additional: { currency: 'USD', language: 'en-us', discountOnly: false },
      },
      publisherId: AGODA_SITE_ID,
    };
    try {
      const res = await fetch('https://affiliateapi7643.agoda.com/api/v3/json/Search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return getMockHotels(cityId);
      const json = await res.json();
      return json.results?.hotels || getMockHotels(cityId);
    } catch { return getMockHotels(cityId); }
  }, TTL.HOTELS);
}

// ── AWIN Booking.com link ─────────────────────────────────────────
async function getCachedAwinLink(destinationUrl: string) {
  const key = `awin:${Buffer.from(destinationUrl).toString('base64').slice(0, 64)}`;
  return cached(key, async () => {
    if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
    try {
      const res = await fetch(
        `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${AWIN_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ advertiserId: parseInt(BOOKING_ADV), destinationUrl }),
        }
      );
      const data = await res.json();
      return data.url || destinationUrl;
    } catch { return destinationUrl; }
  }, TTL.LINK);
}

// ── URL builders ──────────────────────────────────────────────────
function buildAgodaUrl(city: any, ci: string, co: string, adults: number, rooms: number) {
  const p = new URLSearchParams({ city: String(city.agodaCityId), checkIn: ci, checkOut: co, rooms: String(rooms), adults: String(adults), cid: AGODA_SITE_ID });
  return `https://www.agoda.com/search?${p}`;
}
function buildBookingUrl(city: any, ci: string, co: string, adults: number, rooms: number) {
  const p = new URLSearchParams({ ss: city.bookingName, checkin: ci, checkout: co, group_adults: String(adults), no_rooms: String(rooms) });
  return `https://www.booking.com/searchresults.html?${p}`;
}
function buildTripUrl(city: any, ci: string, co: string, adults: number) {
  const dest = `https://www.trip.com/hotels/list?city=${encodeURIComponent(city.name)}&checkIn=${ci}&checkOut=${co}&adult=${adults}`;
  if (!TRIP_SITE_ID) return dest;
  return `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(dest)}`;
}
function buildKlookUrl(city: any, ci: string, co: string, adults: number) {
  const p = new URLSearchParams({ city: city.name, checkin: ci, checkout: co, adults: String(adults), aid: process.env.KLOOK_PARTNER_ID || '' });
  return `https://www.klook.com/hotels/search/?${p}`;
}
function buildExpediaUrl(city: any, ci: string, co: string, adults: number) {
  const dest = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(city.bookingName)}&startDate=${ci}&endDate=${co}&adults=${adults}`;
  const code  = process.env.EXPEDIA_TP_CODE || 'ZZxDEika';
  return `https://expedia.tpx.gr/${code}?url=${encodeURIComponent(dest)}`;
}

// ── Mock data for dev (no API key) ───────────────────────────────
function getMockHotels(cityId: number) {
  return [
    { hotelId:`${cityId}-1`, name:'Grand Palace Hotel',    stars:5, reviewScore:9.1, reviewCount:2341, address:'City Center', imageUrl:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities:['Pool','Spa','WiFi','Gym'], lowestRate:120 },
    { hotelId:`${cityId}-2`, name:'Central Riverside',     stars:4, reviewScore:8.7, reviewCount:1654, address:'Riverside District', imageUrl:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', amenities:['Pool','Restaurant','WiFi'], lowestRate:78  },
    { hotelId:`${cityId}-3`, name:'Ibis Budget City',      stars:3, reviewScore:8.2, reviewCount:4102, address:'Airport Road', imageUrl:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', amenities:['Restaurant','WiFi'], lowestRate:35  },
    { hotelId:`${cityId}-4`, name:'Luxury Boutique Inn',   stars:5, reviewScore:9.4, reviewCount:876,  address:'Old Town', imageUrl:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', amenities:['Spa','Bar','WiFi','Pool'], lowestRate:185 },
    { hotelId:`${cityId}-5`, name:'The Standard Hotel',    stars:4, reviewScore:8.9, reviewCount:1234, address:'Downtown', imageUrl:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', amenities:['Rooftop','Bar','WiFi'], lowestRate:95  },
    { hotelId:`${cityId}-6`, name:'Heritage Garden Hotel', stars:3, reviewScore:7.8, reviewCount:987,  address:'Heritage Quarter', imageUrl:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600', amenities:['Garden','WiFi','Breakfast'], lowestRate:42  },
  ];
}

function offset(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
}
