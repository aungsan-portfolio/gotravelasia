import type { HotelDetail } from "@shared/hotels/types";

export function buildHotelLodgingSchema(hotel: HotelDetail, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: hotel.name,
    image: hotel.images?.[0] || hotel.imageUrl,
    url,
    starRating: hotel.stars
      ? {
          "@type": "Rating",
          ratingValue: hotel.stars,
        }
      : undefined,
    aggregateRating: hotel.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: hotel.rating,
          reviewCount: hotel.reviewCount || 1,
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    geo: (hotel.latitude && hotel.longitude)
      ? {
          "@type": "GeoCoordinates",
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        }
      : undefined,
    amenityFeature: hotel.amenities?.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };
}
