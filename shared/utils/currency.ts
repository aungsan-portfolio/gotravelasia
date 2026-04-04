import { FX_RATES, CurrencyCode, FxQuote } from "../config/fx.js";

/**
 * Converts an amount from one currency to another using the static FX_RATES config.
 * Returns the original amount if no conversion rate is available or if currencies match. 
 */
export function convertPrice(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode, fxQuote?: FxQuote): number {
    if (!amount || !Number.isFinite(amount)) return 0;
    
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    
    if (from === to) return amount;
    
    if (fxQuote && fxQuote.baseCurrency.toUpperCase() === from && fxQuote.quoteCurrency.toUpperCase() === to) {
        return amount * fxQuote.rate;
    }
    
    const rate = FX_RATES[from]?.[to];
    if (rate !== undefined) {
        return amount * rate;
    }
    
    console.warn(`[Currency] No conversion rate from ${from} to ${to}, using original amount.`);
    return amount;
}

/**
 * Wrapper around convertPrice that safely rounds to integer for display if appropriate
 * (Often used for THB which generally doesn't show satang for large flight prices).
 */
export function getDisplayPrice(amount: number, sourceCurrency: CurrencyCode, targetCurrency: CurrencyCode, fxQuote?: FxQuote): number {
    const converted = convertPrice(amount, sourceCurrency, targetCurrency, fxQuote);
    // Usually we want rounded prices for Flights unless USD
    if (targetCurrency.toUpperCase() !== "USD") {
        return Math.round(converted);
    }
    return Math.round(converted * 100) / 100;
}

/**
 * Centralized currency formatter. 
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
    const cur = currency.toUpperCase();
    if (cur === "THB") {
        return `฿${Math.round(amount).toLocaleString()}`;
    }
    if (cur === "USD") {
        return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString()} ${cur}`;
}
