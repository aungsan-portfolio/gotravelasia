import { useCallback } from "react";
import { posthog } from "@/lib/posthog";

type Payload = Record<string, unknown>;

function getUtm() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
  };
}

export function usePostHogEvent() {
  return useCallback((event: string, payload: Payload = {}) => {
    if (typeof window === "undefined" || !posthog.__loaded) {
      return;
    }

    const sessionId = window.sessionStorage.getItem("gt_session_id") || crypto.randomUUID();
    window.sessionStorage.setItem("gt_session_id", sessionId);

    posthog.capture(event, {
      ...payload,
      utm: getUtm(),
      referrer: document.referrer || "direct",
      sessionId,
      url: window.location.href,
    });
  }, []);
}
