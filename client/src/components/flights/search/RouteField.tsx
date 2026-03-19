// components/flights/search/RouteField.tsx
//
// Phase 1: Button that shows the selected airport.
// Phase 2: Wire AirportAutocomplete popover here.

import type { AirportOption } from "@/features/flights/search/flightSearch.types";

interface Props {
  label: string;
  value: AirportOption | null;
  onChange: (airport: AirportOption | null) => void;
  placeholder?: string;
}

export function RouteField({ label, value, placeholder }: Props) {
  return (
    <button
      type="button"
      className="flex min-w-[148px] flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
      aria-label={label}
    >
      {value ? (
        <>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {label}
          </span>
          <span className="mt-0.5 truncate text-sm font-semibold text-neutral-950">
            {value.city}
            <span className="ml-1.5 font-bold text-neutral-400">{value.code}</span>
          </span>
        </>
      ) : (
        <span className="text-sm font-medium text-neutral-500">
          {placeholder ?? label}
        </span>
      )}
    </button>
  );
}
