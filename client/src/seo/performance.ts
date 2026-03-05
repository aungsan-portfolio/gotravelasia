/**
 * @file performance.ts
 * @description Web Vitals tracking.
 *
 * Add to main.tsx:
 *   import { trackWebVitals } from "@/seo/performance";
 *   trackWebVitals();
 *
 * Requires: pnpm add web-vitals
 */

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

type VitalRating = "good" | "needs-improvement" | "poor";
interface Metric { name: string; value: number; rating: VitalRating }

function sendMetric(metric: Metric) {
    // DEV — log to console with colour-coded emoji
    if (import.meta.env.DEV) {
        const emoji =
            metric.rating === "good" ? "✅" :
                metric.rating === "needs-improvement" ? "⚠️" : "❌";
        console.log(
            `${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`
        );
    }

    // PROD — send to Google Analytics if present
    if (import.meta.env.PROD && typeof window.gtag === "function") {
        window.gtag("event", metric.name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            non_interaction: true,
        });
    }
}

/**
 * Track Core Web Vitals.
 * Call once in main.tsx after createRoot.
 *
 * Tracked metrics:
 *   CLS  — Cumulative Layout Shift
 *   LCP  — Largest Contentful Paint
 *   INP  — Interaction to Next Paint (replaces deprecated FID)
 *   TTFB — Time to First Byte
 *   FCP  — First Contentful Paint
 */
export async function trackWebVitals(): Promise<void> {
    try {
        // onFID removed — deprecated in web-vitals v3, replaced by INP
        const { onCLS, onLCP, onINP, onTTFB, onFCP } = await import("web-vitals");
        onCLS(sendMetric);
        onLCP(sendMetric);
        onINP(sendMetric);
        onTTFB(sendMetric);
        onFCP(sendMetric);
    } catch {
        // web-vitals not installed — fail silently
    }
}
