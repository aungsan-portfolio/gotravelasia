import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DatePriceData } from "../../types/hotel-search.types";
import { formatLocalDate, parseIsoLocalDate } from "@/features/hotels/frontdoor/hotelFrontDoor.dates";

interface Props {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
};

const MOBILE_BREAKPOINT = 768;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function SmartDatePicker({ checkIn, checkOut, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [prices, setPrices] = useState<DatePriceData[]>([]);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const cin = checkIn ? parseIsoLocalDate(checkIn) : null;
  const cout = checkOut ? parseIsoLocalDate(checkOut) : null;

  const updateViewportMode = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  const computePopoverPosition = useCallback(() => {
    if (!triggerRef.current || typeof window === "undefined") return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 340;
    const popoverHeight = 360;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < popoverHeight + gap;

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 8) {
      left = window.innerWidth - popoverWidth - 8;
    }
    left = Math.max(8, left);

    setPopoverPosition({
      top: openUpward ? rect.top - popoverHeight - gap : rect.bottom + gap,
      left,
      width: Math.max(rect.width, popoverWidth),
      openUpward,
    });
  }, []);

  useEffect(() => {
    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    return () => window.removeEventListener("resize", updateViewportMode);
  }, [updateViewportMode]);

  useEffect(() => {
    if (!isOpen || isMobile) return;
    computePopoverPosition();

    const onReposition = () => computePopoverPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [computePopoverPosition, isMobile, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inPopover = popoverRef.current?.contains(target);
      const inMobileSheet = mobileSheetRef.current?.contains(target);

      if (!inTrigger && !inPopover && !inMobileSheet) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onEscape);
    document.addEventListener("mousedown", onOutsideClick);

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;

    const monthDate = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    fetch(`/api/frontdoor/prices?month=${monthDate}`)
      .then((r) => r.json())
      .then(setPrices)
      .catch(() => setPrices([]));
  }, [isOpen, month]);

  const days = useMemo(() => {
    const result: Array<Date | null> = [];
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = first.getDay();
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    for (let i = 0; i < start; i++) result.push(null);
    for (let i = 1; i <= last; i++) result.push(new Date(month.getFullYear(), month.getMonth(), i));
    return result;
  }, [month]);

  const handleDateClick = (date: Date) => {
    const next = formatLocalDate(date);

    if (!cin || (cin && cout)) {
      onChange(next, "");
      return;
    }

    if (date <= cin) {
      onChange(next, "");
      return;
    }

    onChange(formatLocalDate(cin), next);
    setIsOpen(false);
  };

  const calendarPanel = (
    <div
      ref={popoverRef}
      className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95"
      style={isMobile ? undefined : { width: 340 }}
    >
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-2">
        <div className="rounded-lg bg-white px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Check-in</p>
          <p className="text-xs font-semibold text-gray-900">{checkIn || "Select"}</p>
        </div>
        <div className="rounded-lg bg-white px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Check-out</p>
          <p className="text-xs font-semibold text-gray-900">{checkOut || "Select"}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="rounded p-1 hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold">{month.toLocaleString("default", { month: "long", year: "numeric" })}</span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="rounded p-1 hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className="py-1 text-[10px] font-bold text-gray-400">{day}</span>
        ))}
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const formatted = formatLocalDate(date);
          const price = prices.find((item) => item.date === formatted);
          const isSelected = (cin && sameDay(date, cin)) || (cout && sameDay(date, cout));
          const inRange = cin && cout && date > cin && date < cout;

          return (
            <button
              type="button"
              key={formatted}
              onClick={() => handleDateClick(date)}
              className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 transition-all
                ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-200" : inRange ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
            >
              <span className="text-xs font-bold">{date.getDate()}</span>
              {price && !isSelected && (
                <div className={`mt-0.5 h-1 w-1 rounded-full ${price.priceHint === "cheap" ? "bg-emerald-500" : price.priceHint === "average" ? "bg-amber-400" : "bg-rose-400"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={triggerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:bg-gray-50"
      >
        <CalendarDays className="h-5 w-5 text-gray-600" aria-hidden="true" />
        <div className="grid flex-1 grid-cols-2 gap-2 text-left">
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-in</p>
            <p className="text-sm font-semibold text-gray-900">{checkIn || "Select"}</p>
            {/* Hidden inputs for E2E testing compatibility */}
            <input 
              type="text" 
              tabIndex={-1}
              aria-hidden="true"
              data-testid="hotel-checkin-input" 
              className="absolute inset-0 h-0 w-0 opacity-0 pointer-events-none"
              value={checkIn}
              readOnly
            />
          </div>
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-out</p>
            <p className="text-sm font-semibold text-gray-900">{checkOut || "Select"}</p>
            <input 
              type="text" 
              tabIndex={-1}
              aria-hidden="true"
              data-testid="hotel-checkout-input" 
              className="absolute inset-0 h-0 w-0 opacity-0 pointer-events-none"
              value={checkOut}
              readOnly
            />
          </div>
        </div>
      </button>

      {isOpen && !isMobile && popoverPosition && createPortal(
        <div
          className="fixed z-[120]"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
            minWidth: popoverPosition.width,
          }}
          data-open-direction={popoverPosition.openUpward ? "up" : "down"}
        >
          {calendarPanel}
        </div>,
        document.body,
      )}

      {isOpen && isMobile && createPortal(
        <div className="fixed inset-0 z-[120] flex items-end bg-black/40 p-2">
          <div ref={mobileSheetRef} className="w-full rounded-t-2xl bg-white p-2 shadow-2xl">
            {calendarPanel}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
