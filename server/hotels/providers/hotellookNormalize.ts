import type { HotellookHotel } from "../../../shared/hotels/providers/hotellookTypes.js";
import type { HotelResult, HotelSearchParams } from "../../../shared/hotels/types.js";

const AMENITY_MAP: Record<string, string> = {
  has_internet: "Free Wi-Fi",
  has_wifi: "Free Wi-Fi",
  has_parking: "Parking",
  has_pool: "Swimming pool",
  has_gym: "Fitness center",
  has_restaurant: "Restaurant",
  has_bar: "Bar",
  has_ac: "Air conditioning",
  has_airport_transfer: "Airport transfer",
  has_spa: "Spa",
};

function extractAmenities(props: Record<string, any>): string[] {
  const amenities: string[] = [];
  Object.entries(AMENITY_MAP).forEach(([propKey, label]) => {
    if (props[propKey] === true || props[propKey] === 1 || props[propKey] === "1") {
      if (!amenities.includes(label)) {
        amenities.push(label);
      }
    }
  });
  // Add some fallback standard amenities if empty
  if (amenities.length === 0) {
    amenities.push("Free Wi-Fi", "Air conditioning");
  }
  return amenities;
}

export function normalizeHotellookHotel(
  h: HotellookHotel,
  criteria: HotelSearchParams,
  marker: string
): HotelResult {
  const hotelId = `hotellook-${h.hotelId}`;
  
  // Build affiliate outbound URL
  const queryParams = new URLSearchParams({
    marker: marker,
    hotel_id: String(h.hotelId),
    check_in: criteria.checkIn,
    check_out: criteria.checkOut,
    adults: String(criteria.adults),
    children: "0",
    locale: "en",
    currency: "USD",
  });
  const outboundUrl = `https://search.hotellook.com/?${queryParams.toString()}`;

  return {
    hotelId,
    name: h.hotelName,
    stars: h.stars || 3,
    reviewScore: h.rating ? Number((h.rating / 10).toFixed(1)) : 7.0, // Hotellook scales 0-100 -> convert to 0-10
    reviewCount: h.popularity || 10,
    address: h.location?.name || "Destination Area",
    imageUrl: `https://photo.hotellook.com/image_v2/limit/h${h.hotelId}_1/800/520.auto`,
    images: [`https://photo.hotellook.com/image_v2/limit/h${h.hotelId}_1/800/520.auto`],
    amenities: extractAmenities(h.props || {}),
    lowestRate: h.priceFrom || 0,
    currency: "USD",
    rankingPosition: h.popularity || 99,
    breakfastIncluded: Boolean(h.props?.has_breakfast),
    freeCancellation: Boolean(h.props?.has_free_cancellation),
    payLater: false, // Default fallback
    outboundLinks: {
      hotellook: outboundUrl,
      metasearch: outboundUrl,
    },
    coordinates: h.location?.geo
      ? {
          lat: h.location.geo.lat,
          lng: h.location.geo.lon,
          confidence: "exact",
        }
      : undefined,
    provider: "hotellook" as const,
  };
}
