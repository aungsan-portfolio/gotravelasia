import React, { memo, useCallback } from "react";
import { Users, ChevronDown, Minus, Plus, Armchair } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { B, CABIN_OPTIONS, type CabinCode, labelStyle, cellFocus } from "./flightWidget.data";

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

function formatTravelerLabel(adults: number, children: number, infants: number): string {
    const total = adults + children + infants;
    return total === 1 ? "1 Traveler" : `${total} Travelers`;
}

const PaxStepper = memo(function PaxStepper({
    label, sub, value, min, max, onChange,
}: {
    label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
    const dec = useCallback(() => onChange(clamp(value - 1, min, max)), [value, min, max, onChange]);
    const inc = useCallback(() => onChange(clamp(value + 1, min, max)), [value, min, max, onChange]);

    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold" style={{ color: B.text }}>{label}</div>
                <div className="text-xs" style={{ color: B.textMuted }}>{sub}</div>
            </div>
            <div role="group" aria-label={label} className="flex items-center gap-2">
                <button
                    type="button" onClick={dec} disabled={value <= min}
                    aria-label={`Decrease ${label}, current ${value}`}
                    className="w-8 h-8 rounded-full border flex flex-col items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                               hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="w-4 text-center text-sm font-bold" aria-live="polite" style={{ color: B.text }}>
                    {value}
                </div>
                <button
                    type="button" onClick={inc} disabled={value >= max}
                    aria-label={`Increase ${label}, current ${value}`}
                    className="w-8 h-8 rounded-full border flex flex-col items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                               hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
});

export interface PassengerMenuProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    adults: number;
    childrenCount: number;
    infants: number;
    cabinClass: CabinCode;
    setAdults: (v: number) => void;
    setChildrenCount: (v: number) => void;
    setInfants: (v: number) => void;
    setCabinClass: (c: CabinCode) => void;
}

export const PassengerMenu = memo(function PassengerMenu({
    open, setOpen, adults, childrenCount, infants, cabinClass,
    setAdults, setChildrenCount, setInfants, setCabinClass
}: PassengerMenuProps) {
    const cabLabel = CABIN_OPTIONS.find(o => o.value === cabinClass)?.label || "Economy";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="w-full flex items-center px-4 py-3 h-full min-h-[64px] transition-colors focus:outline-none"
                    style={open ? cellFocus : {}}
                >
                    <Users className="w-4 h-4 mr-3 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                    <div className="flex flex-col min-w-0 flex-1 text-left">
                        <span style={labelStyle}>Passengers</span>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-white truncate text-[15px] sm:text-base">
                                {formatTravelerLabel(adults, childrenCount, infants)}, {cabLabel}
                            </span>
                            <ChevronDown className={`w-4 h-4 ml-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.5)" }} aria-hidden="true" />
                        </div>
                    </div>
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[320px] sm:w-[350px] p-5 rounded-2xl border bg-white shadow-2xl"
                style={{ borderColor: "rgba(229,231,235,0.6)", zIndex: 99999 }}
                align="end"
                sideOffset={12}
                onInteractOutside={() => setOpen(false)}
            >
                {/* Cabin Class */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Armchair className="w-4 h-4" style={{ color: B.purple }} aria-hidden="true" />
                        <span className="font-bold text-sm" style={{ color: B.text }}>Cabin Class</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select cabin class">
                        {CABIN_OPTIONS.map((cab) => {
                            const active = cab.value === cabinClass;
                            return (
                                <button
                                    key={cab.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setCabinClass(cab.value)}
                                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all border
                                                ${active ? "border-transparent bg-gray-100" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                    style={active ? { background: B.purple, color: B.white } : { color: B.textMuted }}
                                >
                                    {cab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-5" aria-hidden="true" />

                {/* Travelers */}
                <div className="space-y-5">
                    <PaxStepper label="Adults" sub="12+ years" value={adults} min={1} max={9} onChange={setAdults} />
                    <PaxStepper label="Children" sub="2-11 years" value={childrenCount} min={0} max={9} onChange={setChildrenCount} />
                    <PaxStepper label="Infants" sub="Under 2 (Seat/Lap)" value={infants} min={0} max={adults} onChange={setInfants} />
                </div>
            </PopoverContent>
        </Popover>
    );
});
