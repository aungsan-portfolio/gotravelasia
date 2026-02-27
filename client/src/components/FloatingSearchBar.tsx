/**
 * FloatingSearchBar.tsx — Go Travel Asia
 * ─────────────────────────────────────────────────────────────
 * Sticky compact search bar that slides down when the main
 * FlightWidget scrolls out of the viewport.
 *
 * Uses IntersectionObserver (not scroll events) for performance.
 * The header slide-up is dispatched via a custom event
 * "stickyBarToggled" that Layout.tsx listens for.
 */
import { useState, useEffect, useRef } from "react";

export default function FloatingSearchBar() {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const mainWidget = document.getElementById("mainWidget");
    if (!mainWidget) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const show = !entry.isIntersecting;
        setVisible(show);

        // Dispatch event so Layout.tsx can hide/show the main header
        window.dispatchEvent(
          new CustomEvent("stickyBarToggled", { detail: { visible: show } })
        );
      },
      {
        root: null,
        rootMargin: "-56px 0px 0px 0px", // subtract header height (h-14 = 56px)
        threshold: 0,
      }
    );

    observerRef.current.observe(mainWidget);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // When Search is clicked → scroll back up to the main widget
  const handleSearch = () => {
    const mainWidget = document.getElementById("mainWidget");
    if (mainWidget) {
      mainWidget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[999]
        h-[60px] flex items-center px-4 sm:px-6 gap-2 sm:gap-3
        bg-[#FFD700] shadow-[0_2px_12px_rgba(0,0,0,0.12)]
        transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        ${visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
        }
      `}
      style={{ fontFamily: "'Source Sans 3', -apple-system, sans-serif" }}
    >
      {/* ── Logo (compact) ── */}
      <a
        href="/"
        className="text-[17px] font-[800] text-black tracking-[-0.5px] whitespace-nowrap no-underline mr-1 shrink-0 hidden sm:block"
      >
        GoTravel ✈
      </a>

      {/* ── Compact Search Pills Row ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 overflow-x-auto scrollbar-none">

        {/* Trip type pill */}
        <div className="h-9 rounded-[20px] border-[1.5px] border-[#d0d5dd] bg-white flex items-center gap-1.5 px-3 text-[13px] font-semibold text-[#101828] cursor-pointer whitespace-nowrap shrink-0 hover:border-[#667085] transition-colors">
          One-way
        </div>

        {/* Origin airport pill */}
        <div className="h-9 rounded-[20px] border-[1.5px] border-[#d0d5dd] bg-white flex items-center gap-1.5 px-3 text-[13px] font-semibold text-[#101828] cursor-pointer whitespace-nowrap shrink-0 max-w-[140px] hover:border-[#667085] transition-colors">
          <span className="truncate">Yangon</span>
          <span className="w-4 h-4 rounded-full bg-[#e4e7ec] flex items-center justify-center text-[10px] text-[#344054] shrink-0 hover:bg-[#d0d5dd] transition-colors">×</span>
        </div>

        {/* Swap button */}
        <div className="w-[30px] h-[30px] rounded-full bg-white border-[1.5px] border-[#d0d5dd] flex items-center justify-center cursor-pointer shrink-0 hover:bg-[#f0f2f5] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#344054">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
        </div>

        {/* Destination airport pill */}
        <div className="h-9 rounded-[20px] border-[1.5px] border-[#d0d5dd] bg-white flex items-center gap-1.5 px-3 text-[13px] font-semibold text-[#101828] cursor-pointer whitespace-nowrap shrink-0 max-w-[140px] hover:border-[#667085] transition-colors">
          <span className="truncate">Bangkok</span>
          <span className="w-4 h-4 rounded-full bg-[#e4e7ec] flex items-center justify-center text-[10px] text-[#344054] shrink-0 hover:bg-[#d0d5dd] transition-colors">×</span>
        </div>

        {/* Date pill */}
        <div className="h-10 rounded-[20px] border-[1.5px] border-[#d0d5dd] bg-white flex flex-col items-start justify-center px-3 cursor-pointer whitespace-nowrap shrink-0 hover:border-[#667085] transition-colors">
          <span className="text-[13px] font-bold leading-[1.1] text-[#101828]">Select date</span>
          <span className="text-[11px] font-normal leading-[1.1] text-[#667085]">± flexible</span>
        </div>

        {/* Passengers + cabin pill */}
        <div className="h-9 rounded-[20px] border-[1.5px] border-[#d0d5dd] bg-white flex items-center gap-1.5 px-3 text-[13px] font-medium text-[#344054] cursor-pointer whitespace-nowrap shrink-0 hover:border-[#667085] transition-colors">
          1 adult&nbsp;·&nbsp;Economy
        </div>

        {/* Search button — BLACK with yellow text */}
        <button
          onClick={handleSearch}
          className="h-9 px-5 rounded-lg bg-black text-[#FFD700] border-none text-sm font-bold cursor-pointer shrink-0 hover:bg-[#1a1a1a] active:scale-[0.97] transition-all tracking-[0.2px]"
        >
          Search
        </button>
      </div>
    </div>
  );
}
