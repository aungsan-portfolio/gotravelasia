// ── Shared types & constants for FloatingSearchBar ────────────────
export type DropPanel = "trip" | "origin" | "dest" | "date" | "pax" | null;

export const CABIN_LABELS: Record<string, string> = {
    Y: "Economy", W: "Prem. Eco", C: "Business", F: "First",
};

export const TRIP_LABELS: Record<string, string> = {
    "one-way": "One-way", "return": "Return", "multi": "Multi-city",
};

export const DAY_ABBR = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
