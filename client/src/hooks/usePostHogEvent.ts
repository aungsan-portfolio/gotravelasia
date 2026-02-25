import { useCallback } from "react";
import { capturePostHogEvent, getPostHogSessionId } from "@/lib/posthog";

export function usePostHogEvent() {
  return useCallback((action: string, payload: Record<string, unknown> = {}) => {
    capturePostHogEvent(action, {
      ...payload,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      sessionId: getPostHogSessionId(),
    });
  }, []);
}
