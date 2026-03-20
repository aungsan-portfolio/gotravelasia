// client/src/lib/tracking.ts

/**
 * Global declaration for Vercel Analytics (va)
 */
declare global {
  interface Window {
    va?: (event: string, options: { 
      name: string; 
      [key: string]: string | number | boolean;
    }) => void;
  }
}

export const PROVIDERS = ['agoda', 'economybookings', 'travelpayouts', '12go'] as const;
export type AffiliateProvider = typeof PROVIDERS[number];

/**
 * Tracks an affiliate click using both Vercel Analytics and a custom beacon.
 * Uses defensive guards to prevent crashes if analytics scripts are blocked.
 */
export function trackAffiliateClick(
  provider: AffiliateProvider,
  meta: Record<string, string | number | boolean> = {}
) {
  // 1. Defensive Vercel Analytics Track
  try {
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: `click_${provider}`,
        ...meta,
        provider,
        ts: new Date().toISOString()
      });
    }
  } catch (err) {
    // Silent fail for analytics — don't block the user redirect
    console.warn('[Tracking] Vercel Analytics error:', err);
  }

  // 2. Navigator.sendBeacon for reliable tracking during page unload
  // sendBeacon is preferred over fetch keepalive for redirects
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({
        provider,
        meta,
        ts: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
      
      // Ping a custom tracking endpoint (optional — currently silent fails if 404)
      navigator.sendBeacon('/api/track', payload);
    }
  } catch (err) {
    console.warn('[Tracking] Beacon error:', err);
  }
}
