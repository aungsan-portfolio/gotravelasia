import { getTotalTravellers } from "@/features/flights/search/flightSearch.utils";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";
import { useMemo } from "react";

// Helper to parse from URL (mirroring WhiteLabelResultsBridge logic)
function parseAirport(code: string | null) {
  if (!code) return null;
  const c = code.toUpperCase();
  return { code: c, city: c, name: c, country: "" };
}

function useFlightStateFromUrl(): FlightSearchState {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  return useMemo(() => ({
    origin: parseAirport(search.get("origin")),
    destination: parseAirport(search.get("destination")),
    departDate: search.get("depart") ?? null,
    returnDate: search.get("return") ?? null,
    tripType: (search.get("tripType") === "one-way" ? "oneway" : "roundtrip") as "roundtrip" | "oneway",
    travellers: {
      adults: Number(search.get("adults") || 1),
      children: Number(search.get("children") || 0),
      infants: Number(search.get("infants") || 0),
    },
    cabin: "economy",
  }), [search]);
}

interface Props {
  state?: FlightSearchState;
  onClick?: () => void;
}

export function MobileSummaryPill({ state: propState, onClick }: Props) {
  const urlState = useFlightStateFromUrl();
  const state = propState || urlState;

  const origin = state.origin?.code ?? "From";
  const destination = state.destination?.code ?? "To";
  const depart = state.departDate
    ? new Date(state.departDate + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "Depart";
  const ret = state.returnDate
    ? new Date(state.returnDate + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;
  const total = getTotalTravellers(state);

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="mobile-summary-pill"
      className="flex w-full flex-col rounded-xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-black/[0.08] transition hover:shadow-md"
      aria-label="Edit flight search"
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-black tracking-tight text-neutral-950">
          {origin} – {destination}
        </span>
        <svg className="text-neutral-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-0.5 flex items-center gap-3 text-sm text-neutral-500">
        <span>{depart}{ret ? ` – ${ret}` : ""}</span>
        <span className="flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {total}
        </span>
      </div>
    </button>
  );
}
