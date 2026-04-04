// ── Trip type selector pill and dropdown ────────────────────────────

import { TRIP_LABELS } from "./constants";
import { Pill, Caret, DropPanel, DropOpt } from "./Primitives";
import { DropPanel as DropPanelType } from "./constants"; // Import the type

interface TripTypePillProps {
    openPanel: DropPanelType;
    togglePanel: (panel: DropPanelType) => void;
    tripType: string;
    setTripType: (mode: "oneway" | "roundtrip" | "multi") => void;
    setOpen: React.Dispatch<React.SetStateAction<DropPanelType>>;
}

export function TripTypePill({ openPanel, togglePanel, tripType, setTripType, setOpen }: TripTypePillProps) {
    return (
        <Pill active={openPanel === "trip"} onClick={() => togglePanel("trip")} className="hidden md:flex">
            {TRIP_LABELS[tripType ?? "oneway"]}
            <Caret open={openPanel === "trip"} />

            {openPanel === "trip" && (
                <DropPanel left={0} width={158}>
                    {(["oneway", "roundtrip", "multi"] as const).map(val => (
                        <DropOpt
                            key={val}
                            selected={tripType === val}
                            onClick={() => { setTripType(val); setOpen(null); }}
                        >
                            <span className="mr-2 text-[15px]">
                                {val === "oneway" ? "→" : val === "roundtrip" ? "⇄" : "⋯"}
                            </span>
                            {TRIP_LABELS[val]}
                        </DropOpt>
                    ))}
                </DropPanel>
            )}
        </Pill>
    );
}
