const FALLBACK_LABEL = "—";

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export function formatPriceLabel(price: number, currency?: string): string {
  if (!Number.isFinite(price)) {
    return FALLBACK_LABEL;
  }

  if (currency === "THB") {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace(/\s+/g, "");
  }

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return formatCompactNumber(price);
}
