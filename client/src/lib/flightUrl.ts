// ── Dynamic Flight URL Builder ────────────────────────────────────
// Automates search string generation (e.g., RGN1904BKK1) 
// using tomorrow's date by default to avoid expired hardcoded dates.

function getTomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

function formatDate(d: Date): string {
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}${month}`; // e.g. "1904" = April 19
}

// Full search URL builder
export function buildFlightSearchUrl(params: {
  from:        string;   // "RGN"
  to:          string;   // "BKK"
  depart?:     Date;     // optional — default: tomorrow
  returnDate?: Date;     // optional
  passengers?: number;   // default: 1
}): string {
  const {
    from,
    to,
    depart     = getTomorrow(),
    returnDate,
    passengers = 1,
  } = params;

  // Ensure date is in the future
  const safeDepart = depart > new Date() ? depart : getTomorrow();

  const returnStr  = returnDate ? formatDate(returnDate) : "";
  const searchStr  = `${from}${formatDate(safeDepart)}${to}${returnStr}${passengers}`;

  return `/flights/results?flightSearch=${searchStr}`;
}

// Helper for popular route cards
export function buildPopularRouteUrl(from: string, to: string): string {
  return buildFlightSearchUrl({ from, to });
}
