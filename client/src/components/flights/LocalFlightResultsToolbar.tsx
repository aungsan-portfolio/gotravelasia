import type { Dispatch, SetStateAction } from "react";
import type { FlightFilterInput, FlightStopFilter } from "@shared/flights/flightFilters";
import type { FlightSortOption } from "@shared/flights/flightSorting";
import { B } from "./flightWidget.data";

interface LocalFlightResultsToolbarProps {
  filters: FlightFilterInput;
  sortBy: FlightSortOption;
  setFilters: Dispatch<SetStateAction<FlightFilterInput>>;
  setSortBy: Dispatch<SetStateAction<FlightSortOption>>;
  resetFilters: () => void;
  resetSortBy: () => void;
  totalRawFlights: number;
}

const SORT_OPTIONS: { value: FlightSortOption; label: string }[] = [
  { value: "smartMix", label: "SmartMix" },
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "bestValue", label: "Best Value" },
  { value: "earliest", label: "Earliest" },
  { value: "latest", label: "Latest" },
];

const STOP_OPTIONS: { value: "all" | FlightStopFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "nonstop", label: "Nonstop" },
  { value: "1stop", label: "1 stop" },
  { value: "2plus", label: "2+ stops" },
];

export function LocalFlightResultsToolbar({
  filters,
  sortBy,
  setFilters,
  setSortBy,
  resetFilters,
  resetSortBy,
  totalRawFlights,
}: LocalFlightResultsToolbarProps) {
  const selectedStop = filters.stops?.[0] ?? "all";

  const setSingleStop = (value: "all" | FlightStopFilter) => {
    setFilters((prev) => ({
      ...prev,
      stops: value === "all" ? undefined : [value],
    }));
  };

  const toggleFlag = (key: "excludeSelfTransfer" | "baggageIncludedOnly" | "refundableOnly") => {
    setFilters((prev) => {
      const next = !prev[key];
      return { ...prev, [key]: next || undefined };
    });
  };

  return (
    <div
      className="mb-3 p-3 rounded-xl flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: B.textMuted }}>Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FlightSortOption)}
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: B.white, border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: B.textMuted }}>Stops</span>
          <select
            value={selectedStop}
            onChange={(e) => setSingleStop(e.target.value as "all" | FlightStopFilter)}
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: B.white, border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {STOP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            resetFilters();
            resetSortBy();
          }}
          className="md:ml-auto px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "rgba(255,255,255,0.1)", color: B.white, border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Reset filters
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TogglePill
          label="No self-transfer"
          active={Boolean(filters.excludeSelfTransfer)}
          onClick={() => toggleFlag("excludeSelfTransfer")}
        />
        <TogglePill
          label="Bag included"
          active={Boolean(filters.baggageIncludedOnly)}
          onClick={() => toggleFlag("baggageIncludedOnly")}
        />
        <TogglePill
          label="Refundable"
          active={Boolean(filters.refundableOnly)}
          onClick={() => toggleFlag("refundableOnly")}
        />
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          {totalRawFlights} raw
        </span>
      </div>
    </div>
  );
}

interface TogglePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TogglePill({ label, active, onClick }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-bold transition-colors"
      style={active
        ? { background: B.gold, color: B.purpleDeep }
        : { background: "rgba(255,255,255,0.06)", color: B.white, border: "1px solid rgba(255,255,255,0.18)" }}
    >
      {label}
    </button>
  );
}
