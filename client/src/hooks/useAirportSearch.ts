import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook to manage airport search state with debouncing.
 * Prevents rapid-fire API calls while typing.
 */
export function useAirportSearch() {
  const [query,     setQuery]     = useState("");
  const [debounced, setDebounced] = useState("");

  // 300ms debounce — delay search until user pauses typing
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = trpc.flights.airportSearch.useQuery(
    { query: debounced },
    {
      enabled:   debounced.length >= 2,
      staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    }
  );

  return { query, setQuery, results, isFetching };
}
