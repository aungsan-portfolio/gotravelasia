import type { Request, Response } from 'express';
import { getCityBySlug } from '@shared/hotels/cities';
import { buildHotelSearchParams, parseHotelSearchParams, validateHotelSearchParams } from '@shared/hotels/searchParams';
import type { HotelOutboundLinks, HotelResult, HotelSearchResponse, HotelSort } from '@shared/hotels/types';

const AGODA_SITE_ID = process.env.AGODA_SITE_ID ?? '';
const AGODA_API_KEY = process.env.AGODA_API_KEY ?? '';
const AWIN_TOKEN = process.env.AWIN_TOKEN ?? '';
const AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID ?? '';
const BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID ?? '5910';
const TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID ?? '';
const KLOOK_ID = process.env.KLOOK_PARTNER_ID ?? '';
const EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE ?? 'ZZxDEika';
const PAGE_SIZE = 20;

const cache = new Map<string, { val: unknown; exp: number }>();
async function cached<T>(key: string, fn: () => Promise<T>, ttl: number): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.val as T;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttl * 1000 });
  return val;
}

function agodaUrl(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const params = new URLSearchParams(search);
  params.set('city', String(city.agodaCityId));
  params.set('cid', AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}
function agodaHotelUrl(hotelId: string | number, city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const params = new URLSearchParams(search);
  params.set('city', String(city.agodaCityId));
  params.set('hotelId', String(hotelId));
  if (AGODA_SITE_ID) params.set('cid', AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}
function bookingUrl(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const params = new URLSearchParams({
    ss: city.bookingName,
    checkin: search.get('checkIn') ?? '',
    checkout: search.get('checkOut') ?? '',
    group_adults: search.get('adults') ?? '2',
    no_rooms: search.get('rooms') ?? '1',
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
function tripUrl(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const dest = `https://www.trip.com/hotels/list?city=${encodeURIComponent(city.name)}&checkIn=${search.get('checkIn') ?? ''}&checkOut=${search.get('checkOut') ?? ''}&adult=${search.get('adults') ?? '2'}`;
  return TRIP_SITE_ID ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(dest)}` : dest;
}
function klookUrl(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const params = new URLSearchParams({ city: city.name, checkin: search.get('checkIn') ?? '', checkout: search.get('checkOut') ?? '', adults: search.get('adults') ?? '2', aid: KLOOK_ID });
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}
function expediaUrl(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams) {
  const dest = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(city.bookingName)}&startDate=${search.get('checkIn') ?? ''}&endDate=${search.get('checkOut') ?? ''}&adults=${search.get('adults') ?? '2'}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(dest)}`;
}

async function awinDeepLink(destinationUrl: string): Promise<string> {
  const key = `awin:${Buffer.from(destinationUrl).toString('base64').slice(0, 60)}`;
  return cached(key, async () => {
    if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
    try {
      const res = await fetch(`https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${AWIN_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ advertiserId: Number.parseInt(BOOKING_ADV, 10), destinationUrl }),
      });
      const data = await res.json() as { url?: string };
      return data.url ?? destinationUrl;
    } catch {
      return destinationUrl;
    }
  }, 86400);
}

function mapSort(sort: HotelSort) {
  switch (sort) {
    case 'price_asc': return 'priceLowToHigh';
    case 'price_desc': return 'priceHighToLow';
    case 'stars_desc': return 'starRating';
    case 'review_desc': return 'reviewScore';
    default: return 'rank';
  }
}

function createAffiliateLinks(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams, bookingLink: string): HotelOutboundLinks {
  return {
    agoda: agodaUrl(city, search),
    booking: bookingLink,
    trip: tripUrl(city, search),
    klook: klookUrl(city, search),
    expedia: expediaUrl(city, search),
    primary: agodaUrl(city, search),
  };
}

function getMockHotels(cityId: number, city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams): HotelResult[] {
  return [
    { hotelId:`${cityId}-1`, name:'Grand Palace Hotel', stars:5, reviewScore:9.1, reviewCount:2341, address:'City Center', imageUrl:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities:['Pool','Spa','WiFi','Gym'], lowestRate:120, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-1`, city, search) } },
    { hotelId:`${cityId}-2`, name:'Central Riverside', stars:4, reviewScore:8.7, reviewCount:1654, address:'Riverside District', imageUrl:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', amenities:['Pool','Restaurant','WiFi'], lowestRate:78, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-2`, city, search) } },
    { hotelId:`${cityId}-3`, name:'Ibis Budget City', stars:3, reviewScore:8.2, reviewCount:4102, address:'Airport Road', imageUrl:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', amenities:['Restaurant','WiFi'], lowestRate:35, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-3`, city, search) } },
    { hotelId:`${cityId}-4`, name:'Luxury Boutique Inn', stars:5, reviewScore:9.4, reviewCount:876, address:'Old Town', imageUrl:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', amenities:['Spa','Bar','WiFi','Pool'], lowestRate:185, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-4`, city, search) } },
    { hotelId:`${cityId}-5`, name:'The Standard Hotel', stars:4, reviewScore:8.9, reviewCount:1234, address:'Downtown', imageUrl:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', amenities:['Rooftop','Bar','WiFi'], lowestRate:95, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-5`, city, search) } },
    { hotelId:`${cityId}-6`, name:'Heritage Garden Hotel', stars:3, reviewScore:7.8, reviewCount:987, address:'Heritage Quarter', imageUrl:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600', amenities:['Garden','WiFi','Breakfast'], lowestRate:42, provider:'mock', outboundLinks:{ agoda: agodaHotelUrl(`${cityId}-6`, city, search) } },
  ];
}

function normalizeAgodaHotel(raw: any, city: NonNullable<ReturnType<typeof getCityBySlug>>, search: URLSearchParams): HotelResult {
  const hotelId = String(raw.hotelId ?? raw.id ?? raw.propertyId ?? raw.masterHotelId ?? '');
  const roomRate = raw.cheapestRoomOffer?.displayRateInfoWithMarkup?.totalPrice ?? raw.lowestPrice ?? raw.lowestRate ?? raw.price ?? 0;
  const score = Number(raw.reviewScoreAsNumber ?? raw.reviewScore ?? raw.rating ?? 0);
  return {
    hotelId,
    name: String(raw.hotelName ?? raw.name ?? 'Hotel'),
    stars: Number(raw.starRating ?? raw.stars ?? 0),
    reviewScore: score > 10 ? score / 10 : score,
    reviewCount: Number(raw.reviewsCount ?? raw.reviewCount ?? 0),
    address: String(raw.address ?? raw.areaName ?? raw.cityName ?? ''),
    imageUrl: String(raw.imageURL ?? raw.pictureURL ?? raw.thumbnailUrl ?? raw.thumbnail ?? ''),
    amenities: Array.isArray(raw.facilityNameList) ? raw.facilityNameList.slice(0, 8) : Array.isArray(raw.amenities) ? raw.amenities.slice(0, 8) : [],
    lowestRate: Number(roomRate || 0),
    currency: raw.currency || 'USD',
    provider: 'agoda',
    outboundLinks: hotelId ? { agoda: agodaHotelUrl(hotelId, city, search), primary: agodaHotelUrl(hotelId, city, search) } : undefined,
  };
}

async function fetchAgodaHotels(city: NonNullable<ReturnType<typeof getCityBySlug>>, search: ReturnType<typeof parseHotelSearchParams>) {
  const key = `agoda:${city.agodaCityId}:${search.checkIn}:${search.checkOut}:${search.adults}:${search.rooms}:${search.page}:${search.sort}`;
  const searchParams = buildHotelSearchParams(search);
  return cached(key, async () => {
    const warnings: string[] = [];
    if (!AGODA_SITE_ID || !AGODA_API_KEY) {
      warnings.push('Agoda credentials are not configured; returning fallback hotel data.');
      return { source: 'mock' as const, hotels: getMockHotels(city.agodaCityId, city, searchParams), warnings, totalResults: undefined };
    }

    try {
      const body = {
        criteria: {
          checkInDate: search.checkIn,
          checkOutDate: search.checkOut,
          cityId: city.agodaCityId,
          numberOfAdult: search.adults,
          numberOfRoom: search.rooms,
          pageNo: search.page,
          pageSize: PAGE_SIZE,
          sortBy: mapSort(search.sort),
          additional: { currency: 'USD', language: 'en-us', discountOnly: false },
        },
        publisherId: AGODA_SITE_ID,
      };
      const res = await fetch('https://affiliateapi7643.agoda.com/api/v3/json/Search', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: AGODA_API_KEY }, body: JSON.stringify(body) });
      if (!res.ok) {
        warnings.push(`Agoda search returned ${res.status}; using fallback data.`);
        return { source: 'mock' as const, hotels: getMockHotels(city.agodaCityId, city, searchParams), warnings, totalResults: undefined };
      }

      const json = await res.json() as { results?: { hotels?: any[]; totalCount?: number } };
      const rawHotels = json.results?.hotels ?? [];
      if (rawHotels.length === 0) {
        warnings.push('Agoda returned no hotels; using fallback data.');
        return { source: 'mock' as const, hotels: getMockHotels(city.agodaCityId, city, searchParams), warnings, totalResults: undefined };
      }

      return {
        source: 'agoda' as const,
        hotels: rawHotels.map((hotel) => normalizeAgodaHotel(hotel, city, searchParams)),
        warnings,
        totalResults: json.results?.totalCount,
      };
    } catch {
      warnings.push('Agoda search failed; using fallback hotel data.');
      return { source: 'mock' as const, hotels: getMockHotels(city.agodaCityId, city, searchParams), warnings, totalResults: undefined };
    }
  }, 1800);
}

export async function searchHotels(req: Request, res: Response) {
  const parsed = parseHotelSearchParams(req.query as Record<string, unknown>);
  const validation = validateHotelSearchParams(parsed);
  if (!validation.valid) return res.status(400).json({ error: validation.errors[0] });

  const city = getCityBySlug(parsed.city);
  if (!city) return res.status(404).json({ error: `City not found: ${parsed.city}` });
  if (!city.hasHotels) return res.status(400).json({ error: `No hotels for ${city.name}` });

  try {
    const canonical = buildHotelSearchParams(parsed);
    const [agodaResponse, bookingLink] = await Promise.all([
      fetchAgodaHotels(city, parsed),
      awinDeepLink(bookingUrl(city, canonical)),
    ]);

    const response: HotelSearchResponse = {
      city,
      hotels: agodaResponse.hotels,
      affiliateLinks: createAffiliateLinks(city, canonical, bookingLink),
      meta: {
        source: agodaResponse.source,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        adults: parsed.adults,
        rooms: parsed.rooms,
        page: parsed.page,
        pageSize: PAGE_SIZE,
        totalResults: agodaResponse.totalResults,
        hasNextPage: agodaResponse.hotels.length >= PAGE_SIZE,
        sort: parsed.sort,
        warnings: agodaResponse.warnings,
      },
    };

    return res.json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Search failed', detail: msg });
  }
}
