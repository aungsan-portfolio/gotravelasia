// components/flights/search/AirportAutocomplete.tsx
// Travelpayouts Places2 API + keyboard navigation + recent searches

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AirportOption } from "@/features/flights/search/flightSearch.types";
import { SEA_AIRPORTS } from "@/features/flights/search/flightSearch.constants";

// ── API ────────────────────────────────────────────────────────────────────────
const AUTOCOMPLETE_URL = "https://autocomplete.travelpayouts.com/places2";
const RECENT_KEY       = "gta_recent_airports";
const MAX_RECENT       = 5;

async function fetchAirports(query: string): Promise<AirportOption[]> {
  if (query.length < 2) return [];
  const url = new URL(AUTOCOMPLETE_URL);
  url.searchParams.set("term",    query);
  url.searchParams.set("locale",  "en");
  url.searchParams.set("types[]", "airport");
  url.searchParams.set("types[]", "city");

  try {
    const res  = await fetch(url.toString());
    if (!res.ok) throw new Error("API error");
    const data = await res.json() as Array<{
      code: string;
      name: string;
      city_name?: string;
      country_name?: string;
      type: string;
    }>;

    return data.slice(0, 8).map((item) => ({
      code:    item.code,
      city:    item.city_name ?? item.name,
      name:    item.name,
      country: item.country_name ?? "",
    }));
  } catch {
    // Fallback to local list on network error
    const q = query.toLowerCase();
    return (SEA_AIRPORTS as unknown as AirportOption[]).filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q),
    );
  }
}

// ── Recent airports storage ────────────────────────────────────────────────────
function getRecent(): AirportOption[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(airport: AirportOption) {
  try {
    const prev    = getRecent().filter((a) => a.code !== airport.code);
    const updated = [airport, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
interface Props {
  label: string;
  placeholder?: string;
  value: AirportOption | null;
  onChange: (airport: AirportOption | null) => void;
}

export function AirportAutocomplete({ label, placeholder, value, onChange }: Props) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<AirportOption[]>([]);
  const [recent,   setRecent]   = useState<AirportOption[]>([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent airports on mount
  useEffect(() => { setRecent(getRecent()); }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Debounced API fetch
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setLoading(false); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await fetchAirports(q);
      setResults(data);
      setLoading(false);
      setActiveIdx(-1);
    }, 250);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    search(q);
  }

  function handleFocus() {
    setOpen(true);
    if (!query) setResults([]);
  }

  function select(airport: AirportOption) {
    onChange(airport);
    saveRecent(airport);
    setRecent(getRecent());
    setOpen(false);
    setQuery("");
    setActiveIdx(-1);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    inputRef.current?.focus();
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const items = query ? results : recent;
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(items[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIdx] as HTMLLIElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const listItems = query ? results : recent;
  const showList  = open && (listItems.length > 0 || loading);

  return (
    <div ref={containerRef} className="relative">

      {/* ── Trigger / Input ─────────────────────── */}
      {value && !open ? (
        /* Collapsed: show selected airport */
        <button
          type="button"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          className="flex min-w-[148px] flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
          aria-label={`${label}: ${value.city} ${value.code}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {label}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-950">
            <span className="truncate max-w-[90px]">{value.city}</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-bold text-neutral-500">
              {value.code}
            </span>
            {/* Clear x */}
            <button
              type="button"
              onClick={clear}
              aria-label="Clear"
              className="ml-auto rounded-full p-0.5 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-600"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </span>
        </button>
      ) : (
        /* Expanded: text input */
        <div className="relative flex min-w-[148px] items-center rounded-md bg-white px-2 py-1.5 ring-2 ring-yellow-400">
          <svg className="mr-1.5 shrink-0 text-neutral-400" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? label}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls="airport-listbox"
            className="w-full bg-transparent text-sm font-semibold text-neutral-950 placeholder:font-normal placeholder:text-neutral-400 focus:outline-none"
          />
          {loading && (
            <svg className="ml-1 animate-spin shrink-0 text-neutral-300" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M6.5 1.5a5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      )}

      {/* ── Dropdown ────────────────────────────── */}
      {showList && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-black/10"
          role="presentation"
        >
          {/* Section label */}
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            {query ? "Airports & Cities" : "Recent searches"}
          </div>

          <ul
            id="airport-listbox"
            ref={listRef}
            role="listbox"
            aria-label="Airport suggestions"
            className="max-h-64 overflow-y-auto"
          >
            {listItems.map((airport, idx) => (
              <li
                key={airport.code}
                role="option"
                aria-selected={idx === activeIdx}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => select(airport)}
                className={[
                  "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors",
                  idx === activeIdx
                    ? "bg-yellow-50"
                    : "hover:bg-neutral-50",
                ].join(" ")}
              >
                {/* IATA badge */}
                <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[11px] font-black text-neutral-600">
                  {airport.code}
                </span>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-neutral-950">
                    {airport.city}
                  </div>
                  <div className="truncate text-xs text-neutral-400">
                    {airport.name} · {airport.country}
                  </div>
                </div>

                {/* Airport icon */}
                <svg className="shrink-0 text-neutral-300" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </li>
            ))}
          </ul>

          {/* No results */}
          {!loading && query && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-neutral-400">
              No airports found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
