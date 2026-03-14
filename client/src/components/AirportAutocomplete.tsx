import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlaneTakeoff, PlaneLanding, Building2, X } from "lucide-react";
import { useAirportSearch } from "@/hooks/useAirportSearch";
import type { AirportResult } from "../../../server/amadeusAPI";

// The simplified structure expected by FlightSearchContext
interface ContextAirport { 
  code: string; 
  name: string; 
  country: string; 
}

interface Props {
  label:       "From" | "To";
  value:       ContextAirport | null;
  onChange:    (airport: ContextAirport) => void;
  onClear?:    () => void;
  placeholder?: string;
}

export function AirportAutocomplete({ label, value, onChange, onClear, placeholder }: Props) {
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(-1);
  const { query, setQuery, results, isFetching } = useAirportSearch();
  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine what text to show in the input
  const displayText = open
    ? query
    : value
      ? `${value.name}` // Shows "City (Airport)" from Context structure
      : "";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { 
      if (e.key === "Enter" || e.key === "ArrowDown") setOpen(true); 
      return; 
    }
    switch (e.key) {
      case "ArrowDown": 
        e.preventDefault(); 
        setFocused(f => Math.min(f + 1, results.length - 1)); 
        break;
      case "ArrowUp":   
        e.preventDefault(); 
        setFocused(f => Math.max(f - 1, 0));                  
        break;
      case "Enter":     
        if (focused >= 0 && results[focused]) {
          select(results[focused]);
        } else if (results.length > 0) {
          select(results[0]); 
        }
        break;
      case "Escape":    
        setOpen(false); 
        inputRef.current?.blur();                                  
        break;
    }
  }

  function select(r: AirportResult) {
    // Map AirportResult (from API) → Context Airport type
    onChange({ 
      code: r.code, 
      name: `${r.city} (${r.name})`, 
      country: r.country 
    });
    setQuery("");
    setOpen(false);
    setFocused(-1);
  }

  function handleFocus() { 
    setOpen(true); 
    setQuery(""); 
    setFocused(-1); 
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onClear?.();
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const Icon = label === "From" ? PlaneTakeoff : PlaneLanding;

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Input Field ─────────────────────────────────────────────── */}
      <div className={`
        flex items-center gap-2 px-4 py-3 rounded-xl cursor-text
        border transition-all duration-200
        backdrop-blur-md
        ${open
          ? "border-purple-400/60 bg-white/10 shadow-lg shadow-purple-500/20"
          : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25"}
      `}
        onClick={() => inputRef.current?.focus()}
      >
        <Icon size={15} className={`shrink-0 transition-colors ${open ? "text-purple-300" : "text-white/40"}`} />

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35 leading-none mb-1">
            {label}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={displayText}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? (label === "From" ? "Origin city or airport" : "Destination")}
            className="w-full bg-transparent text-white text-sm font-medium
                       placeholder:text-white/25 outline-none truncate"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Clear Button */}
        {value && !open && (
          <button
            onClick={handleClear}
            className="text-white/30 hover:text-white/70 transition-colors p-0.5"
            tabIndex={-1}
          >
            <X size={13} />
          </button>
        )}

        {/* Loading Spinner */}
        {isFetching && (
          <div className="w-3 h-3 border-[1.5px] border-purple-300 border-t-transparent
                          rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* ── Dropdown Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden
                       border border-white/10
                       bg-[#110228]/95 backdrop-blur-xl
                       shadow-2xl shadow-black/60"
          >
            <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {results.length > 0
                ? results.map((r, i) => (
                    <li key={r.code}>
                      <button
                        onMouseDown={() => select(r)}
                        onMouseEnter={() => setFocused(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5
                                    text-left transition-colors duration-75
                                    ${focused === i ? "bg-purple-600/30" : "hover:bg-white/5"}`}
                      >
                        {/* Type Icon */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                         ${r.type === "airport"
                                           ? "bg-purple-500/20 text-purple-300"
                                           : "bg-sky-500/20 text-sky-300"}`}>
                          {r.type === "airport"
                            ? <PlaneTakeoff size={13} />
                            : <Building2   size={13} />}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate leading-tight">
                            {r.city}
                            <span className="text-white/40 font-normal"> · {r.name}</span>
                          </p>
                          <p className="text-white/35 text-xs leading-tight">{r.country}</p>
                        </div>

                        {/* IATA Badge */}
                        <span className="text-xs font-mono font-bold
                                         text-purple-300 bg-purple-500/20
                                         px-2 py-0.5 rounded shrink-0">
                          {r.code}
                        </span>
                      </button>
                    </li>
                  ))
                : (
                    <li className="px-4 py-5 text-center">
                      {query.length >= 2 && !isFetching
                        ? <p className="text-white/35 text-sm">No airports found for "<span className="text-white/60">{query}</span>"</p>
                        : <p className="text-white/25 text-xs">Type at least 2 characters to search...</p>
                      }
                    </li>
                  )
              }
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
