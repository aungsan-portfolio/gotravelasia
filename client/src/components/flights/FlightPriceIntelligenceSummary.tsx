import React from "react";
import { formatCurrencyAmount } from "./priceIntelligence.format";
import type { FlightPriceIntelligenceViewModel } from "./priceIntelligence.viewModel";

interface Props {
  vm: FlightPriceIntelligenceViewModel;
}

export function FlightPriceIntelligenceSummary({ vm }: Props) {
  if (!vm.show) return null;
  if (vm.stateKind === "hidden" || vm.stateKind === "loading" || vm.stateKind === "soft_error") return null;

  return (
    <div
      className="mt-3 px-3 py-2 rounded-lg"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      aria-live="polite"
    >
      <div className="text-sm font-semibold text-white">
        Cheapest known fare: {formatCurrencyAmount(vm.lowestKnownPrice, vm.currency)}
      </div>
      {vm.trendSummaryText && (
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.76)" }}>
          {vm.trendSummaryText}
        </div>
      )}
      <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
        {vm.cheapestDayLabel || vm.confidenceLabel || vm.dataHintText}
      </div>
    </div>
  );
}
