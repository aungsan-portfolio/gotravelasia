export type HotelPriceDisplayMode = "native" | "thb_approx";

/**
 * Placeholder UI-only FX rate.
 * Replace with live FX data later if real conversion support is added.
 */
const DEFAULT_USD_TO_THB_RATE = 36;

interface HotelPricePresentationOptions {
  mode?: HotelPriceDisplayMode;
  showApproximateThb?: boolean;
  usdToThbRate?: number;
  locale?: string;
}

function formatCurrency(amount: number, currency: string, locale = "en-US"): string {
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

function convertToApproxThb(
  amount: number,
  currency: string,
  usdToThbRate: number,
): { amount: number; approximate: boolean } | null {
  if (!Number.isFinite(amount) || amount < 0) return null;

  if (currency === "THB") {
    return { amount, approximate: false };
  }

  if (currency === "USD") {
    return {
      amount: amount * usdToThbRate,
      approximate: true,
    };
  }

  return null;
}

export function getHotelPricePresentation(
  amount: number,
  currency = "USD",
  options: HotelPricePresentationOptions = {},
): {
  primary: string;
  secondary: string | null;
  currencyCode: string;
  isApproximate: boolean;
} {
  const {
    mode = "native",
    showApproximateThb = true,
    usdToThbRate = DEFAULT_USD_TO_THB_RATE,
    locale = "en-US",
  } = options;

  const nativeDisplay = formatCurrency(amount, currency, locale);
  const approxThb = convertToApproxThb(amount, currency, usdToThbRate);

  if (mode === "thb_approx" && approxThb) {
    return {
      primary: formatCurrency(approxThb.amount, "THB", locale),
      secondary: currency !== "THB" ? nativeDisplay : null,
      currencyCode: "THB",
      isApproximate: approxThb.approximate,
    };
  }

  return {
    primary: nativeDisplay,
    secondary:
      showApproximateThb && currency !== "THB" && approxThb
        ? `≈ ${formatCurrency(approxThb.amount, "THB", locale)}`
        : null,
    currencyCode: currency,
    isApproximate: Boolean(
      showApproximateThb && currency !== "THB" && approxThb?.approximate,
    ),
  };
}

export function formatHotelPrice(
  amount: number,
  currency = "USD",
  options: HotelPricePresentationOptions = {},
): string {
  return getHotelPricePresentation(amount, currency, options).primary;
}
