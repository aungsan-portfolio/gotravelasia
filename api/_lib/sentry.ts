import * as Sentry from "@sentry/node";

export function initSentryServer() {
  const dsn = process.env.SENTRY_DSN;
  
  if (dsn && process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
    console.log("[Sentry] Node SDK initialized");
  }
}
