import { getTotalTravellers } from "@/features/flights/search/flightSearch.utils";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";
import { useMemo, useState, useEffect } from "react";

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
  const [visible, setVisible] = useState(false);
  const urlState = useFlightStateFromUrl();
  const state = propState || urlState;

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const origin = state.origin?.code ?? "From";
  const destination = state.destination?.code ?? "To";
  const depart = state.departDate
    ? new Date(state.departDate + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "Depart";
  const ret = state.returnDate
    ? new Date(state.returnDate + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;
  const total = getTotalTravellers(state);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const toolbar = document.getElementById("results-toolbar");
      if (toolbar) {
        toolbar.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  if (!visible && !propState) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid="mobile-summary-pill"
      data-mobile-summary-pill="true"
      aria-label="Modify search"
      className="MobileSummaryPill fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center rounded-2xl bg-slate-950/90 px-4 py-2.5 text-center text-white shadow-2xl backdrop-blur-md transition-all active:scale-95 md:hidden"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
        <span>{origin} – {destination}</span>
        <span className="text-white/40">|</span>
        <span>{depart}{ret ? `–${ret}` : ""}</span>
        <span className="text-white/40">|</span>
        <span className="flex items-center gap-0.5">
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {total}
        </span>
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/50 font-black">
        Modify search
      </div>
    </button>
  );
}
