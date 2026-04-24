import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useAutocomplete } from "../../hooks/useAutocomplete";
import { AutocompleteSuggestion, LocationType } from "../../types/hotel-search.types";
import { resolveSupportedHotelCity } from "@/features/hotels/frontdoor/hotelFrontDoor.mapping";

const LOCATION_ICONS: Record<string, string> = {
  [LocationType.HOTEL]:        "🏨",
  [LocationType.CITY]:         "🏙️",
  [LocationType.AIRPORT]:      "✈️",
  [LocationType.LANDMARK]:     "🗺️",
  [LocationType.NEIGHBORHOOD]: "📍",
};

interface SelectionPayload {
  suggestion: AutocompleteSuggestion;
  citySlug: string | null;
}

interface Props {
  value: string;
  onSelect: (payload: SelectionPayload) => void;
  onInputChange: (value: string) => void;
  placeholder?: string;
}

export default function HotelSearchBox({
  value,
  onSelect,
  onInputChange,
  placeholder = "Where are you going?",
}: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, isLoading } = useAutocomplete(query);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div 
        className="flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 cursor-text"
        onClick={() => containerRef.current?.querySelector('input')?.focus()}
      >
        <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
        <div className="flex-1 text-left pt-0.5">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Destination</p>
          <input
            inputMode="search"
            data-testid="hotel-destination-select"
            className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              setIsOpen(true);
              onInputChange(nextQuery);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full z-[100] mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
          {isLoading ? (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[320px] overflow-y-auto py-2">
              {suggestions.map((s) => (
                <li
                  key={`${s.locationId}-${s.displayName}`}
                  className="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    const citySlug = resolveSupportedHotelCity({ suggestion: s, label: s.displayName });
                    onSelect({ suggestion: s, citySlug });
                    setQuery(s.displayName);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{LOCATION_ICONS[s.locationType] || "📍"}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.displayName}</p>
                      {s.subtitle && <p className="text-xs text-gray-500">{s.subtitle}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">No destinations found</div>
          )}
        </div>
      )}
    </div>
  );
}
