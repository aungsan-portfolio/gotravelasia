// ─── Pure utility functions ───────────────────────────────────────────────
import { getDisplayPrice } from "@shared/utils/currency";
import type { Deal } from "@/hooks/useFlightData";
import type { DestinationMeta } from "./destinations.js";
import {
    CACHE_TTL_MS,
    AIRLINE_NAMES,
    type EnhancedDealCard,
} from "./types.js";

// ── Date ──────────────────────────────────────────────────────────────────
export function parseDateUTC(str: string): Date {
    const parts = str.split("-").map(Number);
    if (parts.length < 3) return new Date();
    const [y, m, day] = parts;
    return new Date(Date.UTC(y, m - 1, day));
}

export function formatDateRange(depart: string, ret?: string): string {
    if (!depart) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fmt = (dt: Date) =>
        `${days[dt.getUTCDay()]} ${dt.getUTCDate()}/${dt.getUTCMonth() + 1}`;
    const d1 = fmt(parseDateUTC(depart));
    return ret ? `${d1} → ${fmt(parseDateUTC(ret))}` : d1;
}

// ── Freshness ─────────────────────────────────────────────────────────────
export function isFresh(deal: EnhancedDealCard): boolean {
    return Date.now() - deal.fetchedAt < CACHE_TTL_MS;
}

export function getPriceLabel(deal: EnhancedDealCard): {
    label: string;
    isStale: boolean;
} {
    const hoursOld = Math.floor(
        Math.max(0, (Date.now() - deal.fetchedAt) / (1000 * 60 * 60))
    );
    if (hoursOld < 1) return { label: "Just updated", isStale: false };
    if (hoursOld < 6) return { label: `${hoursOld}h ago`, isStale: false };
    if (hoursOld < 24) return { label: "Updated recently", isStale: false };
    return { label: "Price may have changed", isStale: true };
}

// ── Scoring ───────────────────────────────────────────────────────────────
export function scoreDeal(
    deal: EnhancedDealCard,
    budgetMax: number,
    originCode?: string
): number {
    const now = Date.now();
    const priceScore = Math.min(budgetMax / deal.price, 1.0);
    const popularityScore =
        deal.impressions > 0
            ? Math.min(deal.clickCount / deal.impressions, 1.0)
            : 0.5;
    const hoursOld = Math.max(0, (now - deal.fetchedAt) / (1000 * 60 * 60));
    const recencyScore = 1 / (hoursOld + 1);
    const personalizationScore =
        originCode && deal.originCode === originCode ? 1.0 : 0.0;

    const hasPersonalization = Boolean(originCode);
    const raw = hasPersonalization
        ? priceScore * 0.40 +
        popularityScore * 0.25 +
        recencyScore * 0.20 +
        personalizationScore * 0.15
        : priceScore * (0.40 / 0.85) +
        popularityScore * (0.25 / 0.85) +
        recencyScore * (0.20 / 0.85);

    return Math.min(raw + (deal.isDirect ? 0.05 : 0), 1.0);
}

// ── Formatting ────────────────────────────────────────────────────────────
export function formatPrice(price: number, currencyCode: string): string {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            currencyDisplay: "narrowSymbol",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        }).format(price);
    } catch {
        return `${price.toLocaleString()} ${currencyCode}`;
    }
}

export function buildSearchUrl(fromCode: string, toCode: string): string {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `/flights/results?flightSearch=${fromCode}${dd}${mm}${toCode}1`;
}

// ── Mapping ───────────────────────────────────────────────────────────────
export function mapToEnhancedDeals(
    routes: Deal[],
    origins: readonly string[],
    destinations: DestinationMeta[],
): EnhancedDealCard[] {
    const now = Date.now();
    const deals: EnhancedDealCard[] = [];

    for (const dest of destinations) {
        let cheapest: Deal | null = null;
        let bestDirect: Deal | null = null;

        for (const route of routes) {
            if (
                origins.includes(route.origin) &&
                route.destination === dest.toCode &&
                route.price > 0 &&
                route.origin !== route.destination
            ) {
                if (!cheapest || route.price < cheapest.price) cheapest = route;

                // Track the cheapest direct flight
                if (route.transfers === 0) {
                    if (!bestDirect || route.price < bestDirect.price) {
                        bestDirect = route;
                    }
                }
            }
        }

        // Prefer direct flight if it exists and is within 30% price premium of the absolute cheapest
        let selectedDeal = cheapest;
        if (cheapest && bestDirect) {
            if (bestDirect.price <= cheapest.price * 1.3) {
                selectedDeal = bestDirect;
            }
        }

        if (!selectedDeal) continue;
        const finalDeal = selectedDeal; // TypeScript narrowing helper

        const fetchTime = finalDeal.found_at
            ? new Date(finalDeal.found_at).getTime()
            : now - CACHE_TTL_MS;

        deals.push({
            id: `${finalDeal.origin}-${dest.toCode}`,
            destination: dest.city,
            destinationCode: dest.toCode,
            country: dest.country,
            originCode: finalDeal.origin,
            imageUrl: dest.image,
            duration: finalDeal.transfers === 0
                ? "Direct"
                : `${finalDeal.transfers} stop${(finalDeal.transfers ?? 0) > 1 ? "s" : ""}`,
            isDirect: finalDeal.transfers === 0,
            departDate: finalDeal.date,
            returnDate: "",
            price: finalDeal.price,
            currency: finalDeal.currency || "USD",
            airline: AIRLINE_NAMES[finalDeal.airline] ?? finalDeal.airline,
            airlineCode: finalDeal.airline_code || finalDeal.airline,
            transfers: finalDeal.transfers ?? 0,
            fetchedAt: fetchTime,
            clickCount: 0,
            impressions: 0,
        });
    }
    return deals;
}

export function getDynamicBudget(deals: EnhancedDealCard[]): {
    budgetUsd: number;
    budgetThb: number;
} {
    if (deals.length === 0) return { budgetUsd: 140, budgetThb: 4900 };
    const maxUsd = Math.max(...deals.map(d => d.price));
    const budgetUsd = Math.ceil(maxUsd / 10) * 10;           // nearest $10
    const budgetThb = Math.ceil(getDisplayPrice(budgetUsd, "USD", "THB") / 100) * 100; // nearest ฿100
    return { budgetUsd, budgetThb };
}
