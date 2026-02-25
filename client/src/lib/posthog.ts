import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialized || posthog.__loaded) {
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_KEY || "phc_placeholder_key", {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
  });

  initialized = true;
}

export { posthog };
