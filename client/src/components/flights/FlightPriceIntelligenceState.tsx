import React from "react";
import type { FlightPriceIntelligenceViewModel } from "./priceIntelligence.viewModel";

interface Props {
  vm: FlightPriceIntelligenceViewModel;
}

export function FlightPriceIntelligenceState({ vm }: Props) {
  if (!vm.show) return null;

  if (vm.stateKind === "loading") {
    return (
      <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.65)" }} aria-live="polite">
        Loading fare intelligence…
      </div>
    );
  }

  if (vm.stateKind === "soft_error") {
    return (
      <div className="mt-2 text-xs" style={{ color: "rgba(255,220,220,0.85)" }} aria-live="polite">
        {vm.softErrorText || "Price intelligence temporarily unavailable."}
      </div>
    );
  }

  if (!vm.hasLiveData && !vm.hasEstimatedData) {
    return (
      <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.65)" }} aria-live="polite">
        No live price signals yet for this route.
      </div>
    );
  }

  if (vm.stateKind === "fallback_only" || vm.isFallbackOnly) {
    return (
      <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.65)" }} aria-live="polite">
        {vm.dataHintText}
      </div>
    );
  }

  return null;
}
