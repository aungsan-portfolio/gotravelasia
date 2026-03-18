// =============================================================================
// GoTravelAsia — FlightSearchWidget
// components/flights/FlightSearchWidget.tsx
//
// Renders the third-party search widget inside an iframe.
// Detects load failures (AdBlocker / CSP / network) and shows a graceful
// fallback with a direct-search link — matching what the screenshot shows
// but with better UX when blocked.
// =============================================================================

"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WidgetStatus = "loading" | "ready" | "blocked";

type Props = {
  /** Pre-built widget URL from your affiliate provider */
  widgetUrl: string;
  /** Direct affiliate search URL — shown when widget is blocked */
  directSearchUrl: string;
  /** Height of the iframe in px (default 480) */
  height?: number;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FlightSearchWidget({
  widgetUrl,
  directSearchUrl,
  height = 480,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<WidgetStatus>("loading");

  // Detect block: if iframe fires onError OR doesn't trigger onLoad within
  // 8 seconds, treat it as blocked.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === "loading") setStatus("blocked");
    }, 8000);

    return () => clearTimeout(timeout);
  }, [status]);

  function handleLoad() {
    // iframe loaded — check if it actually rendered content
    // (cross-origin iframes won't let us read contentDocument, but
    //  a successful load event means the network request went through)
    setStatus("ready");
  }

  function handleError() {
    setStatus("blocked");
  }

  function handleRetry() {
    setStatus("loading");
    if (iframeRef.current) {
      // Force reload by resetting src
      iframeRef.current.src = widgetUrl;
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Blocked banner */}
      {status === "blocked" && (
        <div className="flex flex-col gap-3 p-5 text-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-400" aria-hidden="true">⚠</span>
            <div>
              <p className="font-semibold text-amber-400">Flight Search Blocked</p>
              <p className="mt-1 text-slate-400">
                A privacy setting or ad blocker may be preventing the search
                widget from loading. Try disabling it for this site, or use the
                direct search link below.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-white"
            >
              ↺ Retry Widget
            </button>
            <a
              href={directSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 transition-opacity hover:opacity-90"
            >
              ↗ Open Direct Search
            </a>
          </div>
        </div>
      )}

      {/* Loading shimmer */}
      {status === "loading" && (
        <div
          className="animate-pulse bg-white/5"
          style={{ height }}
          aria-label="Loading flight search…"
          aria-busy="true"
        />
      )}

      {/* Iframe — always mounted so it can load in background */}
      <iframe
        ref={iframeRef}
        src={widgetUrl}
        onLoad={handleLoad}
        onError={handleError}
        width="100%"
        height={height}
        style={{
          border: "none",
          display: status === "blocked" ? "none" : "block",
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        title="Flight Search"
        allow="payment"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
      />
    </div>
  );
}
