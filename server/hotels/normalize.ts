import type {
  HotelResult,
  HotelSearchCity,
  HotelOutboundLinks,
  HotelCoordinatesConfidence,
} from "../../shared/hotels/types.js";
import { agodaHotelUrl } from "../../lib/hotels/affiliate.js";

const PAGE_SIZE = 20;

function normalizeImageUrl(url: any): string | undefined {
  if (typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  
  let candidate = trimmed;
  if (trimmed.startsWith("//")) {
    candidate = `https:${trimmed}`;
  } else if (trimmed.startsWith("http://")) {
    candidate = `https://${trimmed.slice("http://".length)}`;
  } else if (!trimmed.startsWith("https://")) {
    return undefined;
  }
  
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:" && parsed.hostname) {
      return parsed.href;
    }
  } catch (err) {
    // Malformed URL
  }
  
  return undefined;
}

function buildFallbackCoordinates(city: HotelSearchCity, index: number) {
  const cityLat = city.lat;
  const cityLng = city.lng;
  if (typeof cityLat !== "number" || typeof cityLng !== "number") {
    return undefined;
  }
  const angle = index * 137.5 * (Math.PI / 180);
  const radiusKm = 1.2 + (index % 6) * 0.45;
  const latOffset = radiusKm / 111 * Math.cos(angle);
  const lngOffset = radiusKm / (111 * Math.max(0.3, Math.cos(cityLat * Math.PI / 180))) * Math.sin(angle);
  return {
    lat: cityLat + latOffset,
    lng: cityLng + lngOffset,
    isFallback: true
  };
}

function asNonEmptyString(value: any): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function asPositiveFiniteNumber(value: any): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeNeighborhood(rawHotel: any): string | undefined {
  return asNonEmptyString(rawHotel.areaName) ??
         asNonEmptyString(rawHotel.district) ??
         asNonEmptyString(rawHotel.neighborhood) ??
         asNonEmptyString(rawHotel.zone) ??
         asNonEmptyString(rawHotel.location?.district) ??
         asNonEmptyString(rawHotel.location?.neighborhood);
}

function normalizeBreakfastIncluded(rawHotel: any): boolean {
  if (typeof rawHotel.breakfastIncluded === "boolean") return rawHotel.breakfastIncluded;
  if (typeof rawHotel.includeBreakfast === "boolean") return rawHotel.includeBreakfast;
  if (typeof rawHotel.mealPlan?.breakfastIncluded === "boolean") return rawHotel.mealPlan.breakfastIncluded;
  if (typeof rawHotel.boardBasis?.breakfastIncluded === "boolean") return rawHotel.boardBasis.breakfastIncluded;
  
  const planText = asNonEmptyString(rawHotel.mealPlan) ??
                   asNonEmptyString(rawHotel.mealPlanName) ??
                   asNonEmptyString(rawHotel.boardBasis) ??
                   asNonEmptyString(rawHotel.boardType);
                   
  if (!planText) return false;
  const normalized = planText.toLowerCase();
  if (!/\bbreakfast\b/.test(normalized)) return false;
  if (/\b(no breakfast|without breakfast|breakfast excluded|room only)\b/.test(normalized)) {
    return false;
  }
  return true;
}

function normalizeFreeCancellation(rawHotel: any): boolean {
  if (typeof rawHotel.freeCancellation === "boolean") return rawHotel.freeCancellation;
  if (typeof rawHotel.cancellation?.freeCancellation === "boolean") return rawHotel.cancellation.freeCancellation;
  if (typeof rawHotel.refundable === "boolean") return rawHotel.refundable;
  if (typeof rawHotel.isRefundable === "boolean") return rawHotel.isRefundable;
  
  const policyText = asNonEmptyString(rawHotel.cancellationType) ??
                     asNonEmptyString(rawHotel.cancellationPolicy) ??
                     asNonEmptyString(rawHotel.ratePlan?.cancellationPolicy) ??
                     asNonEmptyString(rawHotel.refundType);
                     
  if (!policyText) return false;
  const normalized = policyText.toLowerCase();
  if (/\bnon[- ]?refundable\b/.test(normalized) || /\bno free cancellation\b/.test(normalized)) {
    return false;
  }
  if (/\bfree cancellation\b/.test(normalized) || /\bfully refundable\b/.test(normalized)) {
    return true;
  }
  return false;
}

function normalizePayLater(rawHotel: any): boolean {
  if (typeof rawHotel.payLater === "boolean") return rawHotel.payLater;
  if (typeof rawHotel.payAtHotel === "boolean") return rawHotel.payAtHotel;
  if (typeof rawHotel.payAtProperty === "boolean") return rawHotel.payAtProperty;
  if (typeof rawHotel.payment?.payLater === "boolean") return rawHotel.payment.payLater;
  if (typeof rawHotel.payment?.payAtHotel === "boolean") return rawHotel.payment.payAtHotel;
  
  const paymentText = asNonEmptyString(rawHotel.paymentType) ??
                      asNonEmptyString(rawHotel.paymentDescription) ??
                      asNonEmptyString(rawHotel.ratePlan?.paymentType) ??
                      asNonEmptyString(rawHotel.ratePlan?.paymentDescription);
                      
  if (!paymentText) return false;
  const normalized = paymentText.toLowerCase();
  if (/\bpay later\b/.test(normalized) || /\bpay at hotel\b/.test(normalized) || /\breserve now[, ]*pay later\b/.test(normalized)) {
    return true;
  }
  if (/\bprepaid\b/.test(normalized) || /\bpay now\b/.test(normalized) || /\bfull prepayment\b/.test(normalized)) {
    return false;
  }
  return false;
}

function deriveCoordinatesConfidence(hasExactCoordinates: boolean, hasFallbackCoordinates: boolean): HotelCoordinatesConfidence {
  if (hasExactCoordinates) return "exact";
  if (hasFallbackCoordinates) return "fallback";
  return "approximate";
}

function calculateStayNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(`${checkIn}T00:00:00Z`);
  const checkOutDate = new Date(`${checkOut}T00:00:00Z`);
  const msPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / msPerNight);
  return nights > 0 ? nights : 0;
}

function formatMoney2(amount: number, currency: string) {
  if (!Number.isFinite(amount) || amount < 0) return "";
  if (currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {}
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
}

function buildPriceDisplay(lowestRate: number, currency: string, nights: number) {
  if (!Number.isFinite(lowestRate) || lowestRate <= 0) return undefined;
  const nightly = formatMoney2(lowestRate, currency);
  if (!nightly) return undefined;
  const priceDisplay: any = {
    priceLabel: `${nightly} / night`
  };
  if (nights > 0) {
    const total = formatMoney2(lowestRate * nights, currency);
    if (total) {
      priceDisplay.totalStayEstimateLabel = `${total} total (${nights} ${nights === 1 ? "night" : "nights"})`;
    }
  }
  return priceDisplay;
}

function normalizeHotelImages(rawHotel: any): string[] {
  const extractNested = (arr: any) => 
    Array.isArray(arr) ? arr.map((img: any) => typeof img === 'object' ? (img?.url ?? img?.link ?? img) : img) : [];

  const rawImages = [
    rawHotel.imageUrl,
    rawHotel.imageURL,
    rawHotel.photoURL,
    rawHotel.photoUrl,
    rawHotel.thumbnailURL,
    rawHotel.thumbnailUrl,
    rawHotel.mainPhotoUrl,
    rawHotel.mainPhotoURL,
    rawHotel.hotelImageUrl,
    rawHotel.hotelImageURL,
    rawHotel.image?.url,
    ...extractNested(rawHotel.images),
    ...extractNested(rawHotel.photos),
    ...extractNested(rawHotel.photoList),
    ...extractNested(rawHotel.hotelImages),
  ];

  return Array.from(
    new Set(
      rawImages
        .map(asNonEmptyString)
        .filter((value): value is string => Boolean(value))
        .map(normalizeImageUrl)
        .filter((val): val is string => Boolean(val)),
    ),
  );
}

function normalizeAddress(rawHotel: any, city: HotelSearchCity): string {
  const exactAddress = asNonEmptyString(rawHotel.address) ?? 
                       asNonEmptyString(rawHotel.addressLine1) ?? 
                       asNonEmptyString(rawHotel.location?.address);
  if (exactAddress) return exactAddress;
  
  const areaName = asNonEmptyString(rawHotel.areaName) ?? 
                   asNonEmptyString(rawHotel.district) ?? 
                   asNonEmptyString(rawHotel.neighborhood) ?? 
                   asNonEmptyString(rawHotel.location?.areaName) ?? 
                   asNonEmptyString(rawHotel.location?.district) ??
                   asNonEmptyString(rawHotel.location?.neighborhood);
  if (areaName) return `Near ${areaName}`;
  
  const cityName = asNonEmptyString(rawHotel.cityName) ?? 
                   asNonEmptyString(rawHotel.location?.cityName) ?? 
                   asNonEmptyString(city.name);
  if (cityName) return `Near ${cityName}`;
  
  return "";
}

export function normalizeHotel(
  rawHotel: any,
  city: HotelSearchCity,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  fallbackLinks: HotelOutboundLinks,
  index: number,
  page: number
): HotelResult {
  const hotelId = String(
    rawHotel.hotelId ?? rawHotel.propertyId ?? rawHotel.id ?? `${city.agodaCityId}-${index + 1}`
  );
  const images = normalizeHotelImages(rawHotel);
  const imageUrl = images[0] ?? "";
  
  const amenities = Array.isArray(rawHotel.amenities) 
    ? rawHotel.amenities.map((amenity: any) => String(amenity?.name ?? amenity)).filter(Boolean) 
    : [];
  if (rawHotel.freeWifi === true && !amenities.includes("Free WiFi")) {
    amenities.push("Free WiFi");
  }
  
  const reviewScore = Number(rawHotel.reviewScore ?? rawHotel.reviewScoreRaw ?? rawHotel.review?.score ?? 0);
  const reviewCount = Number(rawHotel.reviewCount ?? rawHotel.reviewCountRaw ?? rawHotel.review?.count ?? 0);
  const stars = Number(rawHotel.stars ?? rawHotel.starRating ?? rawHotel.rating ?? 0);
  const lowestRate = Number(rawHotel.lowestRate ?? rawHotel.price?.amount ?? rawHotel.displayPrice?.amount ?? rawHotel.priceDisplay?.amount ?? rawHotel.dailyRate ?? 0);
  
  const agodaUrl = rawHotel.landingURL ?? (hotelId ? agodaHotelUrl(
    hotelId,
    city.agodaLtCityId ?? city.agodaCityId,
    checkIn,
    checkOut,
    adults,
    rooms
  ) : fallbackLinks.agoda);
  
  const outboundLinks = {
    ...fallbackLinks,
    agoda: agodaUrl
  };
  
  const lat = Number(rawHotel.latitude ?? rawHotel.lat ?? rawHotel.coordinate?.lat ?? rawHotel.coordinates?.lat ?? rawHotel.location?.lat);
  const lng = Number(rawHotel.longitude ?? rawHotel.lng ?? rawHotel.lon ?? rawHotel.coordinate?.lng ?? rawHotel.coordinates?.lng ?? rawHotel.location?.lng);
  
  const hasExactCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const fallbackCoordinates = buildFallbackCoordinates(city, index);
  const coordinates = hasExactCoordinates ? { lat, lng } : fallbackCoordinates;
  const hasFallbackCoordinates = !hasExactCoordinates && Boolean(fallbackCoordinates);
  const coordinatesConfidence = deriveCoordinatesConfidence(hasExactCoordinates, hasFallbackCoordinates);
  
  const rankingPosition = asPositiveFiniteNumber(rawHotel.rankingPosition) ?? 
                          asPositiveFiniteNumber(rawHotel.rank) ?? 
                          asPositiveFiniteNumber(rawHotel.ranking) ?? 
                          (page - 1) * PAGE_SIZE + index + 1;
                          
  const currency = asNonEmptyString(rawHotel.currency) ?? asNonEmptyString(rawHotel.price?.currency) ?? "USD";
  const breakfastIncluded = normalizeBreakfastIncluded(rawHotel);
  const freeCancellation = normalizeFreeCancellation(rawHotel);
  const payLater = normalizePayLater(rawHotel);
  const priceDisplay = buildPriceDisplay(lowestRate, currency, calculateStayNights(checkIn, checkOut));

  return {
    hotelId,
    name: String(rawHotel.name ?? rawHotel.hotelName ?? rawHotel.propertyName ?? "Hotel"),
    stars,
    reviewScore,
    reviewCount,
    address: normalizeAddress(rawHotel, city),
    imageUrl,
    images,
    amenities,
    lowestRate,
    currency,
    rankingPosition,
    coordinates,
    outboundLinks,
    breakfastIncluded,
    freeCancellation,
    payLater,
    provider: "agoda",
    crossedOutRate: Number.isFinite(Number(rawHotel.crossedOutRate)) ? Number(rawHotel.crossedOutRate) : undefined,
    discountPercentage: Number.isFinite(Number(rawHotel.discountPercentage)) && Number(rawHotel.discountPercentage) > 0 ? Number(rawHotel.discountPercentage) : undefined,
    providerPrices: Number.isFinite(lowestRate) && lowestRate > 0 ? { agoda: lowestRate } : undefined,
    coordinatesConfidence,
    priceDisplay
  };
}