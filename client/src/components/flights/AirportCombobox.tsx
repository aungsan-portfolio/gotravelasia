/**
 * AirportCombobox.tsx — Standalone (No airports prop)
 * - Imports AIRPORTS internally
 * - A11y: aria-controls, aria-activedescendant, aria-expanded
 * - Portal dropdown position: fixed (scroll-safe)
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { AIRPORTS, AIRPORT_MAP, type Airport } from "./flightWidget.data";

export const AirportCombobox = memo(function AirportCombobox({
    value,
    onChange,
    label,
}: {
    value: string;
    onChange: (code: string) => void;
    label: string;
}) {
    const selected = AIRPORT_MAP.get(value);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [focusIdx, setFocusIdx] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const listboxId = useId();

    const results = useMemo(() => {
        if (!query || query.length < 1) return [];
        const q = query.toLowerCase();
        return (AIRPORTS as readonly Airport[])
            .filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.code.toLowerCase().includes(q) ||
                a.country.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [query]);

    const select = useCallback((code: string) => {
        onChange(code);
        setOpen(false);
        setQuery("");
        setFocusIdx(-1);
    }, [onChange]);

    // Click outside — check wrapper + dropdown (portalled)
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            const t = e.target as Node;
            if (
                wrapperRef.current && !wrapperRef.current.contains(t) &&
                (!dropdownRef.current || !dropdownRef.current.contains(t))
            ) {
                setOpen(false);
                setQuery("");
                setFocusIdx(-1);
            }
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusIdx(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            const idx = focusIdx >= 0 ? focusIdx : 0;
            select(results[idx].code);
        } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
            setFocusIdx(-1);
        }
    }, [results, focusIdx, select]);

    const displayText = selected ? selected.name.split("(")[0].trim() : value;
    const showDropdown = open && query.length >= 1;
    const activeId = focusIdx >= 0 ? `${listboxId}-opt-${focusIdx}` : undefined;

    // Position (fixed => scroll-safe)
    const rect = wrapperRef.current?.getBoundingClientRect();

    return (
        <div ref={wrapperRef} className="relative flex-1 min-w-0">
            {!open ? (
                // Display mode
                <button
                    type="button"
                    onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="w-full text-left bg-transparent font-bold text-white text-sm outline-none cursor-pointer truncate leading-snug"
                    aria-label={`${label}: ${displayText}`}
                >
                    {displayText}
                </button>
            ) : (
                // Search mode
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setFocusIdx(-1); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type city or code…"
                    autoComplete="off"
                    className="w-full bg-transparent font-bold text-white text-sm outline-none placeholder:text-white/40 leading-snug"
                    aria-label={`Search ${label} airport`}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    aria-controls={showDropdown ? listboxId : undefined}
                    aria-activedescendant={showDropdown ? activeId : undefined}
                />
            )}

            {/* Dropdown via Portal */}
            {showDropdown && rect && createPortal(
                <div
                    ref={dropdownRef}
                    id={listboxId}
                    className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
                    role="listbox"
                    style={{
                        position: "fixed",
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: Math.max(280, rect.width),
                    }}
                >
                    {results.length > 0 ? results.map((a, i) => {
                        const isActive = i === focusIdx;
                        return (
                            <button
                                key={`${a.code}-${a.name}`}
                                id={`${listboxId}-opt-${i}`}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => select(a.code)}
                                onMouseEnter={() => setFocusIdx(i)}
                                className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 border-b border-gray-50 transition-colors ${isActive ? "bg-purple-50" : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                        {a.name.split("(")[0].trim()}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">{a.country}</div>
                                </div>
                                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-bold font-mono bg-purple-100 text-purple-700">
                                    {a.code}
                                </span>
                            </button>
                        );
                    }) : (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No airports found for "<span className="font-semibold text-gray-600">{query}</span>"
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
});
