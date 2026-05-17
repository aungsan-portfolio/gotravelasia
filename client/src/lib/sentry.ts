import * as Sentry from "@sentry/react";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (dsn && import.meta.env.PROD) {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true, // Plan: Mask all text by default for premium privacy
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1, // Plan requirement
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // PII Scrubbing on client reports
        if (event.request && event.request.headers) {
          delete event.request.headers["Authorization"];
          delete event.request.headers["Cookie"];
        }
        return event;
      },
    });
    console.log("[Sentry] React SDK initialized with filters & replay 0.1");
  }
}
