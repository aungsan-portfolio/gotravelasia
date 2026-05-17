import type { HotelResult } from "@shared/hotels/types";

export function buildHotelLodgingSchema(hotel: HotelResult, url: string, cityName?: string) {
  const absoluteImageUrl = hotel.imageUrl?.startsWith("http")
    ? hotel.imageUrl
    : new URL(hotel.imageUrl || "", url).toString();

  const absoluteImages = hotel.images?.map((img) =>
    img.startsWith("http") ? img : new URL(img, url).toString()
  ) || [absoluteImageUrl];

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: hotel.name,
    image: absoluteImages,
    url,
    starRating: hotel.stars
      ? {
          "@type": "Rating",
          ratingValue: hotel.stars,
        }
      : undefined,
    aggregateRating: hotel.reviewScore
      ? {
          "@type": "AggregateRating",
          ratingValue: hotel.reviewScore,
          bestRating: 10,
          reviewCount: hotel.reviewCount || 1,
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: cityName || undefined,
    },
    geo: (hotel.coordinates && !hotel.coordinates.isFallback)
      ? {
          "@type": "GeoCoordinates",
          latitude: hotel.coordinates.lat,
          longitude: hotel.coordinates.lng,
        }
      : undefined,
    amenityFeature: hotel.amenities?.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };
}
