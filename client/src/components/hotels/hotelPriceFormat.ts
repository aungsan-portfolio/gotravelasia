export function formatHotelPrice(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function formatHotelPriceMeta(
  amount: number,
  currency = "USD",
): {
  formatted: string;
  currencyCode: string;
} {
  return {
    formatted: formatHotelPrice(amount, currency),
    currencyCode: currency,
  };
}
