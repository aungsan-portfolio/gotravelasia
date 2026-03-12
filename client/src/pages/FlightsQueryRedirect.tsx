// client/src/pages/FlightsQueryRedirect.tsx
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { getDestinationByCode, getDestinationBySlug } from "@/data/destinationRegistry";

function clean(value: string | null): string {
  return (value ?? "").trim();
}

export default function FlightsQueryRedirect() {
  const [, setLocation] = useLocation();

  const params = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    const origin = clean(search.get("origin")).toUpperCase();
    const destinationRaw = clean(search.get("destination"));
    const depart = clean(search.get("depart"));
    const ret = clean(search.get("return"));
    const tripType = clean(search.get("tripType"));
    const adults = clean(search.get("adults"));
    const children = clean(search.get("children"));
    const cabin = clean(search.get("cabin"));

    return {
      origin,
      destinationRaw,
      depart,
      returnAt: ret,
      tripType,
      adults,
      children,
      cabin,
    };
  }, []);

  useEffect(() => {
    const destinationCode = params.destinationRaw.toUpperCase();

    // Check if we have a landing page for this destination
    const record =
      getDestinationByCode(destinationCode) ||
      getDestinationBySlug(params.destinationRaw);

    if (record) {
      const next = new URLSearchParams();

      if (params.origin) next.set("origin", params.origin);
      // Canonicalize to IATA code if available
      if (record.dest.code) next.set("destination", record.dest.code);
      if (params.depart) next.set("depart", params.depart);
      if (params.returnAt) next.set("return", params.returnAt);
      if (params.tripType) next.set("tripType", params.tripType);
      if (params.adults) next.set("adults", params.adults);
      if (params.children) next.set("children", params.children);
      if (params.cabin) next.set("cabin", params.cabin);

      const query = next.toString();
      setLocation(`/flights/to/${record.slug}${query ? `?${query}` : ""}`, {
        replace: true,
      });
      return;
    }

    // Fallback to generic search results if not in registry
    if (params.origin && destinationCode) {
      setLocation(`/flights/${params.origin.toLowerCase()}/${destinationCode.toLowerCase()}`, {
        replace: true,
      });
      return;
    }

    // Hard fallback to home
    setLocation("/", { replace: true });
  }, [params, setLocation]);

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
          We’re matching your query to a destination landing page.
        </p>
      </div>
    </main>
  );
}
