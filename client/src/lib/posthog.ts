import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY || "phc_placeholder_key", {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
  });

  initialized = true;
}

export function capturePostHogEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, payload);
}

export function getPostHogSessionId(): string | null {
  if (typeof window === "undefined" || !posthog.__loaded) return null;
  const sessionId = posthog.get_session_id();
  return typeof sessionId === "string" ? sessionId : null;
}
