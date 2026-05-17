import * as Sentry from "@sentry/node";

export function initSentryServer() {
  const dsn = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;
  
  if (dsn && process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // Skip common HTTP client errors (401, 403, 404) on server logs
        if (error && (error as any).status) {
          const status = (error as any).status;
          if (status === 401 || status === 403 || status === 404) {
            return null;
          }
        }
        
        // PII Scrubbing
        if (event.request && event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
          delete event.request.headers["x-api-key"];
        }

        return event;
      },
    });
    console.log("[Sentry] Node SDK initialized with filters");
  }
}
