import { useState, useRef, useEffect } from "react";
import { GuestConfig } from "../../types/hotel-search.types";

interface Props {
  value: GuestConfig;
  onChange: (v: GuestConfig) => void;
}

export default function GuestSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof GuestConfig, delta: number) => {
    const newVal = Math.max(key === "rooms" ? 1 : 0, value[key] + delta);
    onChange({ ...value, [key]: newVal });
  };

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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
      >
        <span className="text-xl">👥</span>
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Guests & Rooms</p>
          <p className="text-sm font-semibold text-gray-900">
            {value.adults} Adults · {value.rooms} Room{value.rooms > 1 ? 's' : ''}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-[110] mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="space-y-4">
            <Control label="Rooms" value={value.rooms} onMinus={() => update("rooms", -1)} onPlus={() => update("rooms", 1)} />
            <Control label="Adults" value={value.adults} onMinus={() => update("adults", -1)} onPlus={() => update("adults", 1)} />
            <Control label="Children" value={value.children} onMinus={() => update("children", -1)} onPlus={() => update("children", 1)} />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-transform active:scale-95"
          >
            Apply Selection
          </button>
        </div>
      )}
    </div>
  );
}

function Control({ label, value, onMinus, onPlus }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={onMinus} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">-</button>
        <span className="w-4 text-center text-sm font-bold">{value}</span>
        <button onClick={onPlus} className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100">+</button>
      </div>
    </div>
  );
}
