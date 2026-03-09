// ── Inline calendar date picker panel ─────────────────────────────

import { format, addMonths, getDaysInMonth, getDay } from "date-fns";
import { DropPanel, NavBtn } from "./Primitives";
import { DAY_ABBR } from "./constants";

interface DatePickerPanelProps {
    calMonth: Date;
    setCalMonth: React.Dispatch<React.SetStateAction<Date>>;
    departDate: string | null;
    onPickDate: (d: number) => void;
}

export function DatePickerPanel({ calMonth, setCalMonth, departDate, onPickDate }: DatePickerPanelProps) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const firstDay = getDay(calMonth);
    const daysInM = getDaysInMonth(calMonth);
    const selDate = departDate ? new Date(departDate + "T00:00:00") : null;

    return (
        <DropPanel left={0} width={302} onClick={e => e.stopPropagation()}>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
                <NavBtn onClick={() => setCalMonth(m => addMonths(m, -1))}>‹</NavBtn>
                <span className="text-[13px] font-700 text-white">
                    {format(calMonth, "MMMM yyyy")}
                </span>
                <NavBtn onClick={() => setCalMonth(m => addMonths(m, 1))}>›</NavBtn>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-[3px]">
                {DAY_ABBR.map(d => (
                    <div key={d} className="text-[10px] font-700 text-white/30 text-center py-[3px] tracking-wider">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
                {Array.from({ length: daysInM }).map((_, i) => {
                    const d = i + 1;
                    const thisD = new Date(calMonth.getFullYear(), calMonth.getMonth(), d);
                    const past = thisD < today;
                    const sel = selDate?.toDateString() === thisD.toDateString();
                    const tod = thisD.toDateString() === today.toDateString();
                    return (
                        <div
                            key={d}
                            onClick={() => !past && onPickDate(d)}
                            className={[
                                "aspect-square rounded-[7px] flex items-center justify-center text-[11px] font-[600] transition-all duration-100",
                                past ? "opacity-20 cursor-default text-white/40" : "cursor-pointer",
                                sel ? "bg-[#F5C518] text-[#2d0560] font-[800]" : "",
                                !sel && !past ? "text-white/75 hover:bg-[rgba(245,197,24,0.18)] hover:text-white" : "",
                                tod && !sel ? "border border-[rgba(245,197,24,0.5)] text-[#F5C518]" : "",
                            ].join(" ")}
                        >
                            {d}
                        </div>
                    );
                })}
            </div>
        </DropPanel>
    );
}
