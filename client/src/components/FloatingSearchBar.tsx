/**
 * FloatingSearchBar.tsx — Go Travel Asia
 * ─────────────────────────────────────────────────────────────
 * Floating sticky search bar with GoTravel brand colors:
 *   - Deep purple glassmorphism background
 *   - Gold (#F5C518) search button + accents
 *   - Floating pill shape with border-radius: 16px
 *   - Spring bounce animation on appear
 *
 * Uses IntersectionObserver watching #mainWidget (FlightWidget).
 * Dispatches 'stickyBarToggled' custom event for Layout header.
 * No Sign In button — header's SignInModal is used instead.
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
        window.dispatchEvent(
          new CustomEvent("stickyBarToggled", { detail: { visible: show } })
        );
      },
      {
        root: null,
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      }
    );

    observerRef.current.observe(mainWidget);
    return () => { observerRef.current?.disconnect(); };
  }, []);

  const handleSearch = () => {
    const w = document.getElementById("mainWidget");
    if (w) w.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className={`
        fixed z-[1000]
        left-1/2
        w-[calc(100%-48px)] max-w-[960px]
        h-[60px]
        flex items-center px-4 gap-2
        rounded-2xl
        border border-[rgba(245,197,24,0.25)]
        shadow-[0_8px_32px_rgba(15,5,33,0.45),0_2px_8px_rgba(15,5,33,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]
        backdrop-blur-[16px]
        transition-all ease-[cubic-bezier(0.34,1.20,0.64,1)]
        ${visible
          ? "top-3 -translate-x-1/2 translate-y-0 opacity-100 duration-[380ms]"
          : "top-3 -translate-x-1/2 -translate-y-[calc(100%+12px)] opacity-0 pointer-events-none duration-[280ms]"
        }
      `}
      style={{
        background: "rgba(42, 8, 128, 0.92)",
        fontFamily: "'Plus Jakarta Sans', 'Source Sans 3', sans-serif",
      }}
    >
      {/* ── Logo (compact) ── */}
      <a
        href="/"
        className="flex items-center gap-1.5 text-sm font-extrabold text-white tracking-[-0.3px] no-underline mr-1 shrink-0 hidden sm:flex"
      >
        <span className="w-[26px] h-[26px] bg-[#F5C518] rounded-[6px] flex items-center justify-center text-[13px] shrink-0">
          ✈
        </span>
        <span>
          Go<em className="text-[#F5C518] not-italic">Travel</em>
        </span>
      </a>

      {/* ── Fields Row ── */}
      <div className="flex items-center gap-[5px] flex-1 min-w-0 overflow-x-auto scrollbar-none">

        {/* Trip type pill */}
        <div className="h-9 rounded-full border border-white/[0.18] bg-white/[0.08] flex items-center gap-[5px] px-3 text-[13px] font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors">
          One-way
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Origin airport pill */}
        <div className="h-9 rounded-full border border-white/[0.18] bg-white/[0.08] flex items-center gap-[5px] px-3 text-[13px] font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors">
          <span className="truncate max-w-[90px]">Yangon</span>
          <span className="w-[15px] h-[15px] rounded-full bg-white/[0.15] flex items-center justify-center text-[9px] text-white/80 shrink-0 hover:bg-[rgba(245,197,24,0.4)] hover:text-[#F5C518] transition-colors">
            ×
          </span>
        </div>

        {/* Swap button */}
        <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.15] flex items-center justify-center cursor-pointer shrink-0 text-white/70 hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.5)] hover:text-[#F5C518] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
        </div>

        {/* Destination airport pill */}
        <div className="h-9 rounded-full border border-white/[0.18] bg-white/[0.08] flex items-center gap-[5px] px-3 text-[13px] font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors">
          <span className="truncate max-w-[90px]">Bangkok</span>
          <span className="w-[15px] h-[15px] rounded-full bg-white/[0.15] flex items-center justify-center text-[9px] text-white/80 shrink-0 hover:bg-[rgba(245,197,24,0.4)] hover:text-[#F5C518] transition-colors">
            ×
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Date pill — two rows */}
        <div className="h-10 rounded-full border border-white/[0.18] bg-white/[0.08] flex flex-col items-start justify-center px-3 cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors">
          <span className="text-[13px] font-bold text-white leading-[1.1]">Select date</span>
          <span className="text-[10px] font-medium text-white/50 leading-[1.1]">± flexible</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.12] shrink-0 mx-0.5" />

        {/* Passengers pill */}
        <div className="h-9 rounded-full border border-white/[0.18] bg-white/[0.08] flex items-center gap-[5px] px-3 text-[13px] font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 hover:border-[rgba(245,197,24,0.55)] hover:bg-[rgba(245,197,24,0.10)] transition-colors">
          1 adult · Economy
        </div>

        {/* ── GOLD SEARCH BUTTON ── */}
        <button
          onClick={handleSearch}
          className="h-9 px-[18px] rounded-[10px] bg-[#F5C518] text-[#2d0560] border-none text-[13px] font-extrabold cursor-pointer shrink-0 flex items-center gap-[5px] shadow-[0_2px_10px_rgba(245,197,24,0.45)] hover:bg-[#d4a800] hover:shadow-[0_4px_18px_rgba(245,197,24,0.55)] active:scale-[0.96] transition-all tracking-[0.2px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          Search
        </button>
      </div>
    </div>
  );
}
