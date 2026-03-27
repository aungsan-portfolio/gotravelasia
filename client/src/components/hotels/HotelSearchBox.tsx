import { useState, useRef, useEffect } from "react";
import { useAutocomplete } from "../../hooks/useAutocomplete";
import { AutocompleteSuggestion, LocationType } from "../../types/hotel-search.types";

const LOCATION_ICONS: Record<string, string> = {
  [LocationType.HOTEL]:        "🏨",
  [LocationType.CITY]:         "🏙️",
  [LocationType.AIRPORT]:      "✈️",
  [LocationType.LANDMARK]:     "🗺️",
  [LocationType.NEIGHBORHOOD]: "📍",
};

interface Props {
  value:       string;
  onSelect:    (suggestion: AutocompleteSuggestion) => void;
  placeholder?: string;
}

export default function HotelSearchBox({ value, onSelect, placeholder = "Where are you going?" }: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, isLoading } = useAutocomplete(query);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <span className="text-xl">🔍</span>
        <input
          type="text"
          className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
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
                  key={s.locationId}
                  className="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    onSelect(s);
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
