import { useCallback } from "react";
import posthog from "posthog-js";

export function usePostHogEvent() {
  return useCallback((event: string, payload: Record<string, unknown> = {}) => {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    posthog.capture(event, payload);
  }, []);
}
