import { useState, useEffect, useCallback, useRef } from "react";
import { AutocompleteSuggestion } from "../types/hotel-search.types";

/**
 * Custom hook for debounced hotel autocomplete
 */
export function useAutocomplete(query: string, delay = 300) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      const resp = await fetch(`/api/autocomplete/hotels?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error("Autocomplete lookup failed");
      const data = await resp.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Autocomplete error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(query);
    }, delay);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, delay, fetchData]);

  return { suggestions, isLoading };
}
