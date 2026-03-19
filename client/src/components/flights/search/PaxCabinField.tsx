// components/flights/search/PaxCabinField.tsx
//
// Phase 1: Shows traveller count + cabin class.
// Phase 2: Wire a popover for traveller/cabin selection.

import type {
  CabinClass,
  TravellerState,
} from "@/features/flights/search/flightSearch.types";
import {
  formatCabinLabel,
  getTotalTravellers,
} from "@/features/flights/search/flightSearch.utils";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";

interface Props {
  travellers: TravellerState;
  cabin: CabinClass;
  onTravellersChange: (v: TravellerState) => void;
  onCabinChange: (v: CabinClass) => void;
}

export function PaxCabinField({ travellers, cabin }: Props) {
  const total = travellers.adults + travellers.children + travellers.infants;
  const cabinLabel = formatCabinLabel(cabin);

  return (
    <button
      type="button"
      className="flex shrink-0 flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
      aria-label={`${total} travellers, ${cabinLabel}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Travellers
      </span>
      <span className="mt-0.5 text-sm font-semibold text-neutral-950">
        {total} · {cabinLabel}
      </span>
    </button>
  );
}
