// components/flights/search/DateRangeField.tsx
//
// Phase 1: Shows selected dates as text.
// Phase 2: Wire a date-picker popover (react-day-picker / etc.)

import type { TripType } from "@/features/flights/search/flightSearch.types";
import { formatDateLabel } from "@/features/flights/search/flightSearch.utils";

interface Props {
  tripType: TripType;
  departDate: string | null;
  returnDate: string | null;
  onDepartChange: (v: string | null) => void;
  onReturnChange: (v: string | null) => void;
}

export function DateRangeField({
  tripType,
  departDate,
  returnDate,
}: Props) {
  const departLabel = departDate ? formatDateLabel(departDate) : "Depart";
  const returnLabel = returnDate ? formatDateLabel(returnDate) : "Return";

  return (
    <button
      type="button"
      className="flex min-w-[190px] items-center gap-1 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
      aria-label="Select dates"
    >
      <span className="text-sm font-semibold text-neutral-950">{departLabel}</span>
      {tripType === "roundtrip" && (
        <>
          <span className="text-neutral-300">–</span>
          <span className="text-sm font-semibold text-neutral-950">{returnLabel}</span>
        </>
      )}
    </button>
  );
}
