
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

