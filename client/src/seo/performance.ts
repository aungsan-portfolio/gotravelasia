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
    if (import.meta.env.DEV) {
        const emoji =
            metric.rating === "good" ? "✅" :
                metric.rating === "needs-improvement" ? "⚠️" : "❌";
        console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    }
    if (import.meta.env.PROD && typeof window.gtag === "function") {
        window.gtag("event", metric.name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            non_interaction: true,
        });
    }
}

export async function trackWebVitals(): Promise<void> {
    try {
        // onFID removed — deprecated in web-vitals v3, replaced by INP
        const { onCLS, onLCP, onINP, onTTFB, onFCP } = await import("web-vitals");
        onCLS(sendMetric);
        onLCP(sendMetric);
        onINP(sendMetric);   // ← FID replacement (better metric)
        onTTFB(sendMetric);
        onFCP(sendMetric);   // ← First Contentful Paint (bonus)
    } catch {
        // web-vitals not installed — fail silently
    }
}
