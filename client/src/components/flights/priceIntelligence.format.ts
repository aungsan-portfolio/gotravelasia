export type TrendDirection = "up" | "down" | "flat" | "unknown";

export function formatCurrencyAmount(amount: number | null | undefined, currency = "USD"): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function getConfidenceLabel(score: number | null | undefined): string {
  if (typeof score !== "number" || !Number.isFinite(score)) return "Confidence: unknown";
  if (score >= 0.8) return "Confidence: high";
  if (score >= 0.5) return "Confidence: medium";
  return "Confidence: low";
}

export function getTrendSummaryText(direction: TrendDirection, average: number | null | undefined, currency = "USD"): string {
  const avgLabel = formatCurrencyAmount(average, currency);
  if (direction === "down") return `Prices are trending down around ${avgLabel}.`;
  if (direction === "up") return `Prices are trending up around ${avgLabel}.`;
  if (direction === "flat") return `Prices are relatively stable around ${avgLabel}.`;
  return `Recent trend unavailable. Typical price: ${avgLabel}.`;
}

export function getCheapestDayLabel(dateIso: string | null | undefined, amount: number | null | undefined, currency = "USD"): string {
  if (!dateIso || typeof amount !== "number" || !Number.isFinite(amount)) return "";
  const d = new Date(`${dateIso}T00:00:00`);
  const dateText = Number.isNaN(d.getTime())
    ? dateIso
    : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return `Cheapest day: ${dateText} (${formatCurrencyAmount(amount, currency)})`;
}
