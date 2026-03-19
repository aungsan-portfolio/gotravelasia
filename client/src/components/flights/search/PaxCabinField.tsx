// components/flights/search/PaxCabinField.tsx
// Phase 2: Traveller counter + cabin class selector popover

import { useEffect, useRef, useState } from "react";
import type {
  CabinClass,
  TravellerState,
} from "@/features/flights/search/flightSearch.types";
import { formatCabinLabel } from "@/features/flights/search/flightSearch.utils";
import { MAX_ADULTS, MAX_CHILDREN, MAX_INFANTS } from "@/features/flights/search/flightSearch.constants";

interface Props {
  travellers: TravellerState;
  cabin: CabinClass;
  onTravellersChange: (v: TravellerState) => void;
  onCabinChange: (v: CabinClass) => void;
}

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: "economy",         label: "Economy"         },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business",        label: "Business"        },
  { value: "first",           label: "First"           },
];

function Counter({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-semibold text-neutral-950">{label}</div>
        {sub && <div className="text-xs text-neutral-400">{sub}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          –
        </button>
        <span className="w-4 text-center text-sm font-bold text-neutral-950">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PaxCabinField({ travellers, cabin, onTravellersChange, onCabinChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const total = travellers.adults + travellers.children + travellers.infants;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function setAdults(v: number)   { onTravellersChange({ ...travellers, adults:   v }); }
  function setChildren(v: number) { onTravellersChange({ ...travellers, children: v }); }
  function setInfants(v: number)  { onTravellersChange({ ...travellers, infants:  v }); }

  return (
    <div ref={ref} className="relative">

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${total} travellers, ${formatCabinLabel(cabin)}`}
        className={[
          "flex shrink-0 flex-col items-start rounded-md px-2 py-1.5 text-left",
          "transition-colors hover:bg-neutral-50",
          open ? "bg-neutral-50" : "",
        ].join(" ")}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Travellers
        </span>
        <span className="mt-0.5 text-sm font-semibold text-neutral-950">
          {total} · {formatCabinLabel(cabin)}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Travellers and cabin class"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-black/10"
        >
          {/* Travellers section */}
          <div className="px-4">
            <div className="border-b border-neutral-100 pb-1 pt-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Travellers
            </div>

            <Counter
              label="Adults"
              value={travellers.adults}
              min={1}
              max={MAX_ADULTS}
              onChange={setAdults}
            />
            <Counter
              label="Children"
              sub="2–11 years"
              value={travellers.children}
              min={0}
              max={MAX_CHILDREN}
              onChange={setChildren}
            />
            <Counter
              label="Infants"
              sub="Under 2 years"
              value={travellers.infants}
              min={0}
              max={Math.min(MAX_INFANTS, travellers.adults)}
              onChange={setInfants}
            />

            {travellers.infants > travellers.adults && (
              <p className="mb-2 text-xs text-red-500">
                Infants cannot exceed number of adults.
              </p>
            )}
          </div>

          {/* Cabin class section */}
          <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Cabin class
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CABIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onCabinChange(opt.value)}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                    cabin === opt.value
                      ? "border-yellow-400 bg-yellow-50 text-neutral-950"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done button */}
          <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-neutral-950 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
