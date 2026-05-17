import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import * as Sentry from "@sentry/react";

interface MockDataBannerProps {
  affiliateUrl?: string;
}

export function MockDataBanner({ affiliateUrl }: MockDataBannerProps) {
  const SESSION_KEY = "mock_data_banner_dismissed";

  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false; // SSR safe
    return sessionStorage.getItem(SESSION_KEY) === "true";
  });

  useEffect(() => {
    if (!isDismissed && import.meta.env.PROD) {
      // Sentry breadcrumb requirement
      Sentry.addBreadcrumb({
        category: "mock-data",
        message: "Rendered mock data banner in production",
        level: "info",
      });
    }
  }, []);

  if (isDismissed || !import.meta.env.PROD) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  return (
    <div className="relative mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-1">
      <div className="flex items-start gap-3 pr-8">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-900">
            Development Mode (Mock Data)
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            You are viewing static sample data because live hotel inventory is currently disabled or unavailable. Prices and availability are not real.
          </p>
          {affiliateUrl && (
            <div className="mt-3">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow active:scale-95"
              >
                Compare on Agoda
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-amber-600 hover:bg-amber-100 transition-colors"
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
