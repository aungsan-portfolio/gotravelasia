import { useEffect, useState, useCallback, useMemo } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const USD_TO_THB = 34;

type PriceEntry = {
    value: number;
    trip_class: number;
    show_to_affiliates: boolean;
    return_date: string;
    origin: string;
    destination: string;
    number_of_changes: number;
    gate: string;
    found_at: string;
    distance: number;
    depart_date: string;
    actual: boolean;
};

type PriceMap = Record<string, number>;

type PriceTier = "cheap" | "mid" | "expensive";

function getPriceTier(price: number, thresholds: { low: number; high: number }): PriceTier {
    if (price <= thresholds.low) return "cheap";
    if (price <= thresholds.high) return "mid";
    return "expensive";
}

const TIER_STYLES: Record<PriceTier, string> = {
    cheap: "bg-emerald-50 text-emerald-700 border-emerald-200",
    mid: "bg-amber-50 text-amber-700 border-amber-200",
    expensive: "bg-red-50 text-red-600 border-red-200",
};

const TIER_DOT: Record<PriceTier, string> = {
    cheap: "bg-emerald-400",
    mid: "bg-amber-400",
    expensive: "bg-red-400",
};

function computeThresholds(prices: number[]): { low: number; high: number } {
    if (prices.length === 0) return { low: 0, high: 0 };
    const sorted = [...prices].sort((a, b) => a - b);
    const oneThird = Math.floor(sorted.length / 3);
    return {
        low: sorted[Math.max(oneThird - 1, 0)],
        high: sorted[Math.max(oneThird * 2 - 1, 0)],
    };
}

type PriceCalendarProps = {
    origin: string;
    destination: string;
    calendarMode: "depart" | "return";
    selectedDepart?: Date;
    selectedReturn?: Date;
    onSelectDate: (date: Date | undefined) => void;
    todayDate: Date;
};

export default function PriceCalendar({
    origin,
    destination,
    calendarMode,
    selectedDepart,
    selectedReturn,
    onSelectDate,
    todayDate,
}: PriceCalendarProps) {
    const [priceMap, setPriceMap] = useState<PriceMap>({});
    const [loading, setLoading] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(
        calendarMode === "return" && selectedDepart
            ? new Date(selectedDepart)
            : selectedDepart || todayDate
    );

    const monthStr = useMemo(
        () => format(displayMonth, "yyyy-MM"),
        [displayMonth]
    );

    const nextMonthStr = useMemo(() => {
        const next = new Date(displayMonth);
        next.setMonth(next.getMonth() + 1);
        return format(next, "yyyy-MM");
    }, [displayMonth]);

    const fetchPrices = useCallback(
        async (mo: string) => {
            if (origin === destination) return {};
            try {
                const params = new URLSearchParams({
                    origin,
                    destination,
                    month: mo,
                    currency: "usd",
                });
                const res = await fetch(`/api/calendar-prices?${params}`);
                if (!res.ok) return {};
                const data = await res.json();
                if (!data.data) return {};
                const map: PriceMap = {};
                Object.entries(data.data).forEach(([dateStr, entry]) => {
                    const e = entry as PriceEntry;
                    if (e.value > 0) {
                        map[dateStr] = e.value;
                    }
                });
                return map;
            } catch {
                return {};
            }
        },
        [origin, destination]
    );

    useEffect(() => {
        if (origin === destination) {
            setPriceMap({});
            return;
        }

        let cancelled = false;
        setLoading(true);

        Promise.all([fetchPrices(monthStr), fetchPrices(nextMonthStr)]).then(
            ([m1, m2]) => {
                if (!cancelled) {
                    setPriceMap({ ...m1, ...m2 });
                    setLoading(false);
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [origin, destination, monthStr, nextMonthStr, fetchPrices]);

    const thresholds = useMemo(() => {
        const prices = Object.values(priceMap);
        return computeThresholds(prices);
    }, [priceMap]);

    const selected = calendarMode === "depart" ? selectedDepart : selectedReturn;
    const disabledBefore =
        calendarMode === "return" && selectedDepart ? selectedDepart : todayDate;

    const isMobile =
        typeof window !== "undefined" && window.innerWidth < 640;

    return (
        <div className="relative">
            {loading && (
                <div className="absolute top-2 right-2 z-10">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
            )}

            <DayPicker
                mode="single"
                numberOfMonths={isMobile ? 1 : 2}
                selected={selected}
                onSelect={onSelectDate}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                disabled={[{ before: disabledBefore }]}
                modifiers={{
                    departHighlight: selectedDepart ? [selectedDepart] : [],
                    returnHighlight: selectedReturn ? [selectedReturn] : [],
                    hasPrice: (date: Date) => {
                        const key = format(date, "yyyy-MM-dd");
                        return key in priceMap;
                    },
                }}
                modifiersClassNames={{
                    departHighlight: "!bg-primary !text-white rounded-md",
                    returnHighlight: "!bg-amber-500 !text-white rounded-md",
                }}
                className={cn(
                    "bg-white p-3",
                    "[--cell-size:52px] sm:[--cell-size:56px]"
                )}
                classNames={{
                    months: "flex gap-6 flex-col md:flex-row",
                    month: "flex flex-col w-full gap-3",
                    nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
                    month_caption: "flex items-center justify-center h-8 w-full px-10",
                    caption_label: "text-sm font-semibold text-gray-900 select-none",
                    weekdays: "flex",
                    weekday: "text-gray-400 rounded-md flex-1 font-normal text-xs select-none text-center",
                    week: "flex w-full mt-0.5",
                    day: "relative w-full h-full p-0 text-center group/day select-none",
                    today: "bg-gray-50 rounded-md",
                    outside: "text-gray-300",
                    disabled: "text-gray-300 opacity-50",
                    hidden: "invisible",
                }}
                components={{
                    Chevron: ({ orientation }) =>
                        orientation === "left" ? (
                            <ChevronLeftIcon className="size-4" />
                        ) : (
                            <ChevronRightIcon className="size-4" />
                        ),
                    DayButton: (props: DayButtonProps) => {
                        const { day, modifiers, className, children, ...rest } = props;
                        const dateKey = format(day.date, "yyyy-MM-dd");
                        const price = priceMap[dateKey];
                        const thbPrice = price ? Math.round(price * USD_TO_THB) : null;
                        const tier = price ? getPriceTier(price, thresholds) : null;

                        const isSelected =
                            modifiers.selected ||
                            modifiers.range_start ||
                            modifiers.range_end;
                        const isDisabled = modifiers.disabled;

                        return (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isDisabled}
                                data-selected-single={isSelected}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0 w-full h-full min-w-[var(--cell-size)] min-h-[var(--cell-size)] rounded-lg font-normal p-0.5 transition-colors",
                                    isSelected && "!bg-primary !text-white",
                                    !isSelected && !isDisabled && tier && "hover:ring-1 hover:ring-gray-200",
                                    className
                                )}
                                {...rest}
                            >
                                <span className={cn(
                                    "text-sm leading-none",
                                    isSelected ? "font-bold" : "font-medium",
                                    isDisabled && "text-gray-300"
                                )}>
                                    {day.date.getDate()}
                                </span>

                                {thbPrice && !isDisabled ? (
                                    <span
                                        className={cn(
                                            "text-[9px] leading-none mt-0.5 px-1 py-px rounded font-medium tabular-nums",
                                            isSelected
                                                ? "text-white/80"
                                                : tier
                                                    ? TIER_STYLES[tier]
                                                    : "text-gray-400"
                                        )}
                                    >
                                        ฿{thbPrice >= 10000
                                            ? `${(thbPrice / 1000).toFixed(1)}k`
                                            : thbPrice.toLocaleString()}
                                    </span>
                                ) : !isDisabled && !modifiers.outside ? (
                                    <span className="text-[9px] leading-none mt-0.5 text-transparent select-none">—</span>
                                ) : null}
                            </Button>
                        );
                    },
                }}
            />

            {Object.keys(priceMap).length > 0 && (
                <div className="flex items-center justify-center gap-4 pt-2 pb-1 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", TIER_DOT.cheap)} />
                        <span className="text-[10px] text-gray-500">Cheap</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", TIER_DOT.mid)} />
                        <span className="text-[10px] text-gray-500">Average</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", TIER_DOT.expensive)} />
                        <span className="text-[10px] text-gray-500">Expensive</span>
                    </div>
                </div>
            )}
        </div>
    );
}
