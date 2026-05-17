import type { HotelResult } from "@shared/hotels/types";

export function buildHotelSearchResultSchema(hotels: HotelResult[], currentUrl: string) {
  // Take top 10 for schema to avoid blowing up payload size
  const topHotels = hotels.slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: currentUrl,
    numberOfItems: topHotels.length,
    itemListElement: topHotels.map((hotel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LodgingBusiness",
        name: hotel.name,
        url: `${new URL(currentUrl).origin}/hotels/${hotel.hotelId || hotel.id}`,
        image: hotel.imageUrl,
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
              reviewCount: hotel.reviewCount || 1,
            }
          : undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: hotel.address,
        },
      },
    })),
  };
}
