// client/src/pages/FlightsQueryRedirect.tsx

import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  getDestinationByCode,
  getDestinationBySlug,
} from "@/data/destinationRegistry";
import { resolveFlightsRedirectPath } from "@/lib/flights/resolveFlightsRedirect";

function readQuery() {
  const search = new URLSearchParams(window.location.search);

  return {
    origin: search.get("origin"),
    destination: search.get("destination"),
    depart: search.get("depart"),
    returnAt: search.get("return"),
    tripType: search.get("tripType"),
    adults: search.get("adults"),
    children: search.get("children"),
    cabin: search.get("cabin"),
  };
}

export default function FlightsQueryRedirect() {
  const [, setLocation] = useLocation();

  const query = useMemo(() => readQuery(), []);

  useEffect(() => {
    const nextPath = resolveFlightsRedirectPath(query, {
      findByCode: getDestinationByCode,
      findBySlug: getDestinationBySlug,
    });

    setLocation(nextPath, { replace: true });
  }, [query, setLocation]);

  return (
    <main className="min-h-[60vh] bg-[#0b0719] text-white">
      <div className="mx-auto max-w-3xl px-4 py-20">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/80">
          Redirecting
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Opening the best route page…
        </h1>
        <p className="mt-3 text-white/65">
          We’re matching your search to a destination landing page.
        </p>
      </div>
    </main>
  );
}
