/**
 * FloatingSearchBar.tsx — Go Travel Asia
 * ─────────────────────────────────────────────────────────────
 * Compact search bar embedded in the Layout Navbar header.
 * Reads from FlightSearchContext (populated by FlightWidget).
 *
 * Search button → validates → buildSearchURL() → navigate (SPA).
 * × buttons → clear field + scroll back to main widget.
 * ⇄ button → context.swapAirports()
 */
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { useLocation } from "wouter";
import { format, isValid } from "date-fns";
import posthog from "posthog-js";

const CABIN_LABELS: Record<string, string> = {
  Y: "Economy", W: "Premium Eco", C: "Business", F: "First",
};

function fmtShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return isValid(d) ? format(d, "d MMM") : dateStr;
}

export default function FloatingSearchBar() {
  const ctx = useFlightSearch();
  const [, setLocation] = useLocation();

  // ── Derived display values ──────────────────────────────────────────
  const originName = ctx.origin?.name?.split("(")[0].trim() ?? "Origin";
  const destName = ctx.destination?.name?.split("(")[0].trim() ?? "Destination";
  const tripLabel = ctx.tripType === "one-way" ? "One-way" : "Return";
  const cabinLabel = CABIN_LABELS[ctx.cabinClass] ?? "Economy";

  const totalPax = ctx.adults + ctx.childCount + ctx.infants;
  const paxLabel = `${totalPax} ${totalPax === 1 ? "adult" : "travelers"} · ${cabinLabel}`;

  // Date display based on tripType
  let dateLabel = "Select date";
  let dateSub = "± flexible";
  if (ctx.tripType === "one-way") {
    if (ctx.departDate) dateLabel = fmtShortDate(ctx.departDate);
    else dateLabel = "Select date";
  } else {
    // return trip
    if (ctx.departDate && ctx.returnDate) {
      dateLabel = `${fmtShortDate(ctx.departDate)} → ${fmtShortDate(ctx.returnDate)}`;
      dateSub = "";
    } else if (ctx.departDate) {
      dateLabel = `${fmtShortDate(ctx.departDate)} → ?`;
    } else {
      dateLabel = "Select dates";
    }
  }

  // ── Scroll to main widget ────────────────────────────────────────────
  const scrollToWidget = () => {
    const w = document.getElementById("mainWidget");
    if (w) w.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ── Search handler (Option 2) ─────────────────────────────────────────
  const handleSearch = () => {
    // Validate
    if (!ctx.origin || !ctx.destination) {
      scrollToWidget();
      return;
    }
    if (!ctx.departDate) {
      scrollToWidget();
      return;
    }

    const urlObj = ctx.buildSearchURL();
    if (!urlObj) { scrollToWidget(); return; }

    // PostHog tracking (separate from pure buildSearchURL)
    if (typeof posthog !== "undefined" && posthog.__loaded) {
      posthog.capture("search_flights_clicked", {
        from: "floating_bar",
        origin: ctx.origin.code,
        destination: ctx.destination.code,
        departDate: ctx.departDate,
        returnDate: ctx.returnDate,
        flexibility: ctx.flexibility,
      });
    }

    // Navigate to in-site TPWL results
    window.location.href = urlObj.travelpayouts;
  };

  // ── × clear handlers ──────────────────────────────────────────────────
  const clearOrigin = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.setOrigin(null);
    scrollToWidget();
  };
  const clearDestination = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.setDestination(null);
    scrollToWidget();
  };

  // ── Pill style constants ───────────────────────────────────────────────
  const pillCls = "h-7 rounded-sm border border-white/[0.18] bg-white/[0.08] flex items-center gap-[5px] px-2 text-[12px] font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors";

  return (
    <div
      className="
        h-[44px]
        flex items-center px-4 gap-2
        rounded-xl
        border border-[rgba(245,197,24,0.25)]
        shadow-sm
        transition-all ease-[cubic-bezier(0.34,1.20,0.64,1)]
        duration-300
      "
      style={{
        background: "rgba(42, 8, 128, 0.8)",
        backdropFilter: "blur(12px)",
        fontFamily: "'Plus Jakarta Sans', 'Source Sans 3', sans-serif",
      }}
    >
      {/* ── Fields Row ── */}
      <div className="flex items-center gap-[5px] flex-1 min-w-0 overflow-x-auto scrollbar-none">

        {/* Trip type pill - hidden on mobile to save space */}
        <div className={`${pillCls} hidden md:flex`} onClick={scrollToWidget}>
          {tripLabel}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Origin airport pill */}
        <div className={pillCls} onClick={scrollToWidget}>
          <span className="truncate max-w-[60px] xs:max-w-[80px]">{originName}</span>
          {ctx.origin && (
            <span
              onClick={clearOrigin}
              className="w-[12px] h-[12px] rounded-full bg-white/[0.15] flex items-center justify-center text-[8px] text-white/80 shrink-0 hover:bg-[rgba(245,197,24,0.4)] hover:text-[#F5C518] transition-colors"
            >
              ×
            </span>
          )}
        </div>

        {/* Swap button */}
        <div
          onClick={() => ctx.swapAirports()}
          className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.15] flex items-center justify-center cursor-pointer shrink-0 text-white/70 hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.5)] hover:text-[#F5C518] transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
        </div>

        {/* Destination airport pill */}
        <div className={pillCls} onClick={scrollToWidget}>
          <span className="truncate max-w-[60px] xs:max-w-[80px]">{destName}</span>
          {ctx.destination && (
            <span
              onClick={clearDestination}
              className="w-[12px] h-[12px] rounded-full bg-white/[0.15] flex items-center justify-center text-[8px] text-white/80 shrink-0 hover:bg-[rgba(245,197,24,0.4)] hover:text-[#F5C518] transition-colors"
            >
              ×
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Date pill */}
        <div
          onClick={scrollToWidget}
          className="h-8 rounded-sm border border-white/[0.18] bg-white/[0.08] flex flex-col items-start justify-center px-2 cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors"
        >
          <span className="text-[12px] font-bold text-white leading-[1.1]">{dateLabel}</span>
          {dateSub && <span className="text-[9px] font-medium text-white/50 leading-[1.1]">{dateSub}</span>}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Passengers pill - shortened on mobile */}
        <div className={pillCls} onClick={scrollToWidget}>
          <span className="hidden xs:inline">{paxLabel}</span>
          <span className="xs:hidden">{totalPax} Pax</span>
        </div>

        {/* ── GOLD SEARCH BUTTON ── */}
        <button
          onClick={handleSearch}
          className="h-8 px-[12px] rounded-lg bg-[#F5C518] text-[#2d0560] border-none text-[12px] font-extrabold cursor-pointer shrink-0 flex items-center gap-[4px] shadow-[0_2px_8px_rgba(245,197,24,0.3)] hover:bg-[#d4a800] hover:shadow-[0_2px_12px_rgba(245,197,24,0.4)] active:scale-[0.96] transition-all tracking-[0.2px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          Search
        </button>
      </div>
    </div>
  );
}
