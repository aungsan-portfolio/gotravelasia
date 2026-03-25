import type { HotelItem, HotelResultsQuery, HotelResultsResponse } from "@/types/hotels";

const MOCK_HOTELS: HotelItem[] = [
  {
    id: "bkk-riverside-grand",
    name: "Riverside Grand Bangkok",
    starRating: 5,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
    location: {
      addressLine: "257 Charoen Nakhon Rd",
      area: "Riverside",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.7262, lng: 100.5077 },
    },
    pricePerNight: { amount: 232, currency: "USD", taxesAndFeesIncluded: true },
    review: { score: 9.1, count: 2481 },
    amenities: ["Pool", "Spa", "Airport transfer", "Gym"],
    badges: ["Best value", "Near BTS"],
    isFreeBreakfast: true,
    isFreeCancellation: true,
    isPayLater: true,
    deepLinks: {
      primary: "https://example.com/hotel/bkk-riverside-grand",
      booking: "https://example.com/hotel/bkk-riverside-grand?partner=booking",
      agoda: "https://example.com/hotel/bkk-riverside-grand?partner=agoda",
    },
  },
  {
    id: "bkk-sukhumvit-loft",
    name: "Sukhumvit Loft Hotel",
    starRating: 4,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    location: {
      addressLine: "88 Sukhumvit Soi 11",
      area: "Sukhumvit",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.7431, lng: 100.556 },
    },
    pricePerNight: { amount: 118, currency: "USD", taxesAndFeesIncluded: true },
    review: { score: 8.6, count: 1840 },
    amenities: ["Rooftop bar", "Gym", "Coworking"],
    badges: ["Popular area"],
    isFreeBreakfast: false,
    isFreeCancellation: true,
    isPayLater: true,
    deepLinks: {
      primary: "https://example.com/hotel/bkk-sukhumvit-loft",
      booking: "https://example.com/hotel/bkk-sukhumvit-loft?partner=booking",
      trip: "https://example.com/hotel/bkk-sukhumvit-loft?partner=trip",
    },
  },
  {
    id: "bkk-oldtown-courtyard",
    name: "Old Town Courtyard Bangkok",
    starRating: 3,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
    location: {
      addressLine: "41 Tanao Road",
      area: "Rattanakosin",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.7569, lng: 100.4988 },
    },
    pricePerNight: { amount: 64, currency: "USD", taxesAndFeesIncluded: false },
    review: { score: 8.2, count: 754 },
    amenities: ["Wi‑Fi", "Family rooms"],
    badges: ["Budget pick"],
    isFreeBreakfast: true,
    isFreeCancellation: false,
    isPayLater: false,
    deepLinks: {
      primary: "https://example.com/hotel/bkk-oldtown-courtyard",
      agoda: "https://example.com/hotel/bkk-oldtown-courtyard?partner=agoda",
    },
  },
  {
    id: "bkk-lumpini-residence",
    name: "Lumpini Park Residence",
    starRating: 4,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80",
    location: {
      addressLine: "170 Rama IV Road",
      area: "Silom",
      city: "Bangkok",
      country: "Thailand",
      coordinates: { lat: 13.7302, lng: 100.5417 },
    },
    pricePerNight: { amount: 96, currency: "USD", taxesAndFeesIncluded: true },
    review: { score: 8.9, count: 1208 },
    amenities: ["Breakfast", "Pool", "Business center"],
    badges: ["Great for couples"],
    isFreeBreakfast: true,
    isFreeCancellation: true,
    isPayLater: false,
    deepLinks: {
      primary: "https://example.com/hotel/bkk-lumpini-residence",
      booking: "https://example.com/hotel/bkk-lumpini-residence?partner=booking",
    },
  },
];

export async function fetchMockHotels(
  _query: HotelResultsQuery,
  signal?: AbortSignal,
): Promise<HotelResultsResponse> {
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(resolve, 280);

    if (!signal) {
      return;
    }

    const abortListener = () => {
      clearTimeout(timeoutId);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };

    signal.addEventListener("abort", abortListener, { once: true });
  });

  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }

  return {
    hotels: MOCK_HOTELS,
    total: MOCK_HOTELS.length,
  };
}
