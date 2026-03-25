import type { HotelItem, HotelSort } from "@/types/hotels";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  return usdFormatter.format(value);
}

export function formatReviewLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  return "Rated";
}

export function formatStayNights(checkInIso: string, checkOutIso: string): string {
  const checkIn = new Date(checkInIso);
  const checkOut = new Date(checkOutIso);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return "Flexible dates";
  }

  const oneDayMs = 1000 * 60 * 60 * 24;
  const rawNights = Math.round((checkOut.getTime() - checkIn.getTime()) / oneDayMs);
  const nights = Math.max(1, rawNights);

  return `${nights} night${nights > 1 ? "s" : ""}`;
}

export function sortHotels(hotels: HotelItem[], sort: HotelSort): HotelItem[] {
  const safe = [...hotels];

  safe.sort((a, b) => {
    switch (sort) {
      case "price_low_to_high":
        return a.pricePerNight.amount - b.pricePerNight.amount;
      case "price_high_to_low":
        return b.pricePerNight.amount - a.pricePerNight.amount;
      case "rating_high_to_low":
        return b.review.score - a.review.score;
      case "stars_high_to_low":
        return b.starRating - a.starRating;
      case "recommended":
      default: {
        const scoreA = a.review.score * 100 + a.review.count / 100;
        const scoreB = b.review.score * 100 + b.review.count / 100;
        return scoreB - scoreA;
      }
    }
  });

  return safe;
}
