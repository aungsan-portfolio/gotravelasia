import { useState, useEffect, useMemo } from "react";
import { DatePriceData } from "../../types/hotel-search.types";

function toISO(d: Date) { return d.toISOString().split("T")[0]; }
function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Props {
  checkIn:  string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

export default function SmartDatePicker({ checkIn, checkOut, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [prices, setPrices] = useState<DatePriceData[]>([]);

  // Simple calendar math
  const days = useMemo(() => {
    const result = [];
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = first.getDay();
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < start; i++) result.push(null);
    for (let i = 1; i <= last; i++) result.push(new Date(month.getFullYear(), month.getMonth(), i));
    return result;
  }, [month]);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/frontdoor/prices?month=${toISO(month).substring(0, 7)}`)
      .then(r => r.json())
      .then(setPrices)
      .catch(() => setPrices([]));
  }, [isOpen, month]);

  const cin = checkIn ? parseDate(checkIn) : null;
  const cout = checkOut ? parseDate(checkOut) : null;

  const handleDateClick = (d: Date) => {
    if (!cin || (cin && cout)) {
      onChange(toISO(d), "");
    } else if (d < cin) {
      onChange(toISO(d), "");
    } else {
      onChange(toISO(cin), toISO(d));
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:bg-gray-50"
      >
        <span className="text-xl">📅</span>
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Check-in — Check-out</p>
          <p className="text-sm font-semibold text-gray-900">
            {checkIn ? `${checkIn} → ${checkOut || 'Select Checkout'}` : 'Select dates'}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full z-[105] mt-2 w-[340px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded">←</button>
            <span className="text-sm font-bold">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400 py-1">{d}</span>)}
            {days.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const price = prices.find(p => p.date === toISO(d));
              const isSelected = (cin && sameDay(d, cin)) || (cout && sameDay(d, cout));
              const inRange = cin && cout && d > cin && d < cout;

              return (
                <button
                  key={toISO(d)}
                  onClick={() => handleDateClick(d)}
                  className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 transition-all
                    ${isSelected ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' : inRange ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
                  `}
                >
                  <span className="text-xs font-bold">{d.getDate()}</span>
                  {price && !isSelected && (
                    <div className={`mt-0.5 h-1 w-1 rounded-full ${price.priceHint === 'cheap' ? 'bg-emerald-500' : price.priceHint === 'average' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
