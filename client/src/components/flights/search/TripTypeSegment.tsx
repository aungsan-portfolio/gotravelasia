// components/flights/search/TripTypeSegment.tsx

import type { TripType } from "@/features/flights/search/flightSearch.types";

interface Props {
  value: TripType;
  onChange: (v: TripType) => void;
}

const ITEMS: { value: TripType; label: string }[] = [
  { value: "roundtrip", label: "Return"  },
  { value: "oneway",    label: "One-way" },
];

export function TripTypeSegment({ value, onChange }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {ITEMS.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
            ].join(" ")}
            aria-pressed={active}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
