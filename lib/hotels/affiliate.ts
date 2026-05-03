import type { HotelOutboundLinks } from "../../shared/hotels/types";

const AGODA_SITE_ID = process.env.AGODA_SITE_ID?.replace(/,/g, "").trim() || "";
const TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID || "";
const KLOOK_ID = process.env.KLOOK_PARTNER_ID || "";
const EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE || "ZZxDEika";
const BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID || "5910";
const AWIN_TOKEN = process.env.AWIN_TOKEN || "";
const AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID || "";

export function agodaSearchUrl(cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    city: String(cityId),
    checkIn,
    checkOut,
    rooms: String(rooms),
    adults: String(adults),
    cid: AGODA_SITE_ID,
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}

export function agodaHotelUrl(hotelId: string, cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    hotel_id: hotelId,
    city: String(cityId),
    checkIn,
    checkOut,
    adults: String(adults),
    rooms: String(rooms),
  });
  if (AGODA_SITE_ID) params.set("cid", AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}

export function bookingUrl(destinationName: string, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    ss: destinationName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function tripUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${adults}`;
  return TRIP_SITE_ID ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(destination)}` : destination;
}

export function klookUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const params = new URLSearchParams({
    city: cityName,
    checkin: checkIn,
    checkout: checkOut,
    adults: String(adults),
  });
  if (KLOOK_ID) params.set("aid", KLOOK_ID);
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}

export function expediaUrl(destinationName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}&startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(destination)}`;
}

export function shouldIncludeExpediaLink(expediaCode: string) {
  const normalized = expediaCode.trim();
  if (!normalized) return false;
  if (/placeholder|your|replace|sample|example|todo/i.test(normalized)) return false;
  // Check for non-latin chars (like Burmese)
  if (/[\u1000-\u109f]/.test(normalized)) return false;
  return true;
}

/**
 * Generates an Awin deep link for a given destination URL.
 * In a real scenario, this would call Awin's Link Builder API or use a local generator.
 */
export async function awinDeepLink(destinationUrl: string): Promise<string> {
  // Simple implementation for now as seen in index.js
  if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
  try {
    const response = await fetch(
      `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AWIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advertiserId: parseInt(BOOKING_ADV, 10),
          destinationUrl,
        }),
      }
    );
    const payload = (await response.json()) as { url?: string };
    return payload.url ?? destinationUrl;
  } catch {
    return destinationUrl;
  }
}

export function buildAffiliateLinks(
  cityName: string,
  bookingName: string,
  cityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
): HotelOutboundLinks {
  const links: HotelOutboundLinks = {
    agoda: agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms),
    booking: bookingUrl(bookingName, checkIn, checkOut, adults, rooms),
    trip: tripUrl(cityName, checkIn, checkOut, adults),
    klook: klookUrl(cityName, checkIn, checkOut, adults),
  };

  if (shouldIncludeExpediaLink(EXPEDIA_CODE)) {
    links.expedia = expediaUrl(bookingName, checkIn, checkOut, adults);
  }

  return links;
}
