import React, { useEffect, useMemo, useRef } from "react";
import PriceCalendar from "@/components/PriceCalendar";

const MemoizedPriceCalendar = React.memo(PriceCalendar, (prev, next) =>
    prev.origin === next.origin &&
    prev.destination === next.destination &&
    prev.calendarMode === next.calendarMode &&
    prev.selectedDepart?.getTime() === next.selectedDepart?.getTime() &&
    prev.selectedReturn?.getTime() === next.selectedReturn?.getTime()
);

export function CalendarDropdown({
    open,
    onClose,
    calendarMode,
    setCalendarMode,
    origin,
    destination,
    selectedDepart,
    selectedReturn,
    todayDate,
    onSelectDate,
    onCheapestPrice,
    tripType,
    onSkipReturn,
}: {
    open: boolean;
    onClose: () => void;
    calendarMode: "depart" | "return";
    setCalendarMode: (m: "depart" | "return") => void;
    origin: string;
    destination: string;
    selectedDepart?: Date;
    selectedReturn?: Date;
    todayDate: Date;
    onSelectDate: (d: Date | undefined) => void;
    onCheapestPrice: (p: number | null) => void;
    tripType: "return" | "one-way";
    onSkipReturn: () => void;
}) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // focus trap (basic)
    useEffect(() => {
        if (!open) return;
        const el = dialogRef.current;
        if (!el) return;

        const focusable = () =>
            Array.from(el.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
                .filter(n => !n.hasAttribute("disabled"));

        const first = () => focusable()[0];
        const last = () => focusable().slice(-1)[0];

        const t = setTimeout(() => first()?.focus(), 0);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            const f = first();
            const l = last();
            if (!f || !l) return;

            if (e.shiftKey && document.activeElement === f) {
                e.preventDefault(); l.focus();
            } else if (!e.shiftKey && document.activeElement === l) {
                e.preventDefault(); f.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            clearTimeout(t);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-label={`Select ${calendarMode === "depart" ? "departure" : "return"} date`}
                className="relative z-40 flex justify-center mt-2">
                <div ref={dialogRef}
                    className="bg-white rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 w-full max-w-[740px]"
                    style={{ border: "1.5px solid rgba(91,14,166,0.10)" }}>
                    <div role="tablist" aria-label="Select departure or return date" className="flex gap-2 mb-4">
                        {(["depart", "return"] as const).map(m => (
                            <button key={m} type="button" role="tab" aria-selected={calendarMode === m}
                                onClick={() => setCalendarMode(m)}
                                className="px-4 py-1.5 rounded-full text-sm font-bold transition-all">
                                {m === "depart" ? "Departure" : "Return"}
                            </button>
                        ))}

                        {tripType === "return" && calendarMode === "return" && (
                            <button type="button" onClick={onSkipReturn}
                                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors ml-auto">
                                Skip return
                            </button>
                        )}
                    </div>

                    <MemoizedPriceCalendar
                        origin={origin}
                        destination={destination}
                        calendarMode={calendarMode}
                        selectedDepart={selectedDepart}
                        selectedReturn={selectedReturn}
                        onSelectDate={onSelectDate}
                        onCheapestPrice={onCheapestPrice}
                        todayDate={todayDate}
                    />
                </div>
            </div>
        </>
    );
}
