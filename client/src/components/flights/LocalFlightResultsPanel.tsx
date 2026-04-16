import { AlertTriangle, Plane } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { FlightFilterInput } from "@shared/flights/flightFilters";
import type { FlightSortOption } from "@shared/flights/flightSorting";
import type { SearchResultItem, UseFlightSearchOptions } from "@/hooks/useFlightSearch";
import type { HackerFareCombination } from "@shared/flights/hackerFare";
import { B } from "./flightWidget.data";
import { LocalFlightResultCard } from "./LocalFlightResultCard";
import { HackerFareCard } from "./HackerFareCard";
import { LocalFlightResultsToolbar } from "./LocalFlightResultsToolbar";

interface LocalFlightResultsPanelProps {
  committedSearch: UseFlightSearchOptions | null;
  flights: SearchResultItem[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
  filters: FlightFilterInput;
  sortBy: FlightSortOption;
  setFilters: Dispatch<SetStateAction<FlightFilterInput>>;
  setSortBy: Dispatch<SetStateAction<FlightSortOption>>;
  resetFilters: () => void;
  resetSortBy: () => void;
  rawFlightsCount: number;
}

export function LocalFlightResultsPanel({
  committedSearch,
  flights,
  loading,
  error,
  isEmpty,
  refetch,
  filters,
  sortBy,
  setFilters,
  setSortBy,
  resetFilters,
  resetSortBy,
  rawFlightsCount,
}: LocalFlightResultsPanelProps) {
  if (!committedSearch) {
    return null;
  }

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between p-4 rounded-t-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Plane className="w-5 h-5" style={{ color: B.gold }} />
          API Live Results ({flights.length} shown)
        </h3>
        <span className="text-xs text-white/60 mr-3 hidden sm:inline">
          Showing {flights.length} of {rawFlightsCount}
        </span>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.1)", color: B.white }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div
        className="p-4 rounded-b-2xl overflow-hidden"
        style={{ background: "rgba(20,20,30,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none" }}
      >
        <LocalFlightResultsToolbar
          filters={filters}
          sortBy={sortBy}
          setFilters={setFilters}
          setSortBy={setSortBy}
          resetFilters={resetFilters}
          resetSortBy={resetSortBy}
          totalRawFlights={rawFlightsCount}
        />

        {loading && flights.length === 0 && (
          <div className="py-12 text-center text-white/50 animate-pulse">
            Scouring the skies for the best deals...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl text-red-200" style={{ background: "rgba(255,0,0,0.15)" }}>
            <h4 className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Search Error</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {isEmpty && !error && (
          <div className="py-12 text-center text-white/50">
            No flights found for this route.
          </div>
        )}

        {flights.length > 0 && (
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {flights.map((flight, idx) => {
              if (isHackerFareResult(flight)) {
                return <HackerFareCard key={flight.id} flight={flight} index={idx} />;
              }
              return <LocalFlightResultCard key={flight.id} flight={flight} index={idx} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function isHackerFareResult(flight: SearchResultItem): flight is HackerFareCombination {
  return "totalPrice" in flight;
}
