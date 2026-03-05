import { onCLS, onINP, onLCP, onTTFB, onFCP, Metric } from 'web-vitals';

/**
 * Sends Web Vitals metrics to analytics or console.
 */
function sendToAnalytics(metric: Metric) {
    const body = JSON.stringify(metric);
    // In production, you might send this to an analytics endpoint:
    // navigator.sendBeacon('/api/analytics', body);

    // For development, we log it to console
    if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, Math.round(metric.value * 10) / 10, metric.rating);
    }
}

/**
 * Initializes listeners for Core Web Vitals.
 */
export function trackWebVitals() {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
}
