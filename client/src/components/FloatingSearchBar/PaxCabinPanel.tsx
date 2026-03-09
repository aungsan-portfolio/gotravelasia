// ── Pax counters and cabin class selector panel ───────────────────

import { CABIN_LABELS } from "./constants";
import { DropPanel, CountBtn } from "./Primitives";

interface PaxCabinPanelProps {
    adults: number; setAdults: React.Dispatch<React.SetStateAction<number>>;
    children: number; setChildren: React.Dispatch<React.SetStateAction<number>>;
    infants: number; setInfants: React.Dispatch<React.SetStateAction<number>>;
    cabin: string; setCabin: React.Dispatch<React.SetStateAction<string>>;
    commitPax: () => void;
}

export function PaxCabinPanel({
    adults, setAdults, children, setChildren, infants, setInfants, cabin, setCabin, commitPax
}: PaxCabinPanelProps) {
    return (
        <DropPanel left="auto" right={0} width={220} onClick={e => e.stopPropagation()}>
            {/* Pax counters */}
            {[
                { label: "Adults", sub: "12+ yrs", val: adults, setVal: setAdults, min: 1 },
                { label: "Children", sub: "2–11 yrs", val: children, setVal: setChildren, min: 0 },
                { label: "Infants", sub: "Under 2", val: infants, setVal: setInfants, min: 0 },
            ].map(({ label, sub, val, setVal, min }) => (
                <div key={label} className="flex items-center justify-between py-[8px] border-b border-[rgba(255,255,255,0.06)] last:border-none">
                    <div>
                        <div className="text-[13px] font-[600] text-white">{label}</div>
                        <div className="text-[10px] text-white/40">{sub}</div>
                    </div>
                    <div className="flex items-center gap-[8px]">
                        <CountBtn disabled={val <= min} onClick={() => setVal(v => Math.max(min, v - 1))}>−</CountBtn>
                        <span className="text-[14px] font-[700] text-white min-w-[16px] text-center">{val}</span>
                        <CountBtn disabled={val >= 9} onClick={() => setVal(v => Math.min(9, v + 1))}>+</CountBtn>
                    </div>
                </div>
            ))}

            {/* Cabin */}
            <div className="mt-[8px]">
                <div className="text-[10px] font-700 tracking-wider text-white/30 uppercase mb-[6px]">Cabin class</div>
                <div className="grid grid-cols-2 gap-[4px]">
                    {Object.entries(CABIN_LABELS).map(([code, label]) => (
                        <div
                            key={code}
                            onClick={() => setCabin(code)}
                            className={[
                                "py-[6px] px-[8px] rounded-[8px] border text-[11px] font-[600] cursor-pointer text-center transition-all",
                                cabin === code
                                    ? "bg-[rgba(245,197,24,0.15)] border-[rgba(245,197,24,0.45)] text-[#F5C518]"
                                    : "bg-[rgba(255,255,255,0.04)] border-transparent text-white/50 hover:bg-[rgba(245,197,24,0.1)] hover:text-white",
                            ].join(" ")}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Done */}
            <button
                onClick={commitPax}
                className="w-full mt-[10px] py-[8px] rounded-[9px] bg-[#F5C518] text-[#2d0560] font-[800] text-[12px] cursor-pointer border-none hover:bg-[#d4a800] transition-colors"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
                Done ✓
            </button>
        </DropPanel>
    );
}
