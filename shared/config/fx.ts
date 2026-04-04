export type CurrencyCode = "USD" | "THB" | string;

export type FxQuote = {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: "live" | "stale_cache" | "fallback_static";
  asOf: string | null;
};

/**
 * Centralized static exchange rates.
 * This is a transitional step before live rates are introduced.
 */
export const FX_RATES: Record<string, Record<string, number>> = {
  USD: { THB: 34 },
  THB: { USD: 1 / 34 },
};
