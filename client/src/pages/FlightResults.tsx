import { useEffect, useMemo, useState } from "react";
import SEO from "@/seo/SEO";
import { StaysSection } from "@/components/flights/stays-section";
import { CarsSection } from "@/components/flights/cars-section";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getCityName } from "@/lib/cities";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: any;
    TPWL_EXTRA?: any;
  }
}

const WL_ID               = "12942";
const TP_MARKER           = "697202";
const SCRIPT_ID           = "tpwl-main-script";
const WEEDLE_SCRIPT_CLASS = "tpwl-weedle-script";
const WEEDLE_POLL_INTERVAL_MS = 300;
const WEEDLE_TIMEOUT_MS       = 6000;

type WidgetState = "loading" | "ready" | "fallback";
type PopularDestination = { code: string; city: string; country: string };

const POPULAR_DESTINATIONS: PopularDestination[] = [
  { code: "SIN", city: "Singapore",    country: "Singapore" },
  { code: "BKK", city: "Bangkok",      country: "Thailand"  },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia"  },
  { code: "HAN", city: "Hanoi",        country: "Vietnam"   },
  { code: "DPS", city: "Bali",         country: "Indonesia" },
  { code: "HKT", city: "Phuket",       country: "Thailand"  },
];

function safeParam(v: string | null, fallback = "") {
  return v ? decodeURIComponent(v) : fallback;
}

function normalizeCode(v: string | null): string {
  return safeParam(v).toUpperCase().trim();
}

function safeIsoDate(v: string | null): string | null {
  const raw = safeParam(v).trim();
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function getRouteLabel(search: URLSearchParams): string {
  const o = safeParam(search.get("origin"));
  const d = safeParam(search.get("destination"));
  if (o && d) return `${o.toUpperCase()} → ${d.toUpperCase()}`;
  const m = safeParam(search.get("flightSearch")).match(/^([A-Z]{3})\d{4}([A-Z]{3})/);
  if (m) return `${m[1]} → ${m[2]}`;
  return "";
}

/**
 * Parses Travelpayouts compact search format into individual fields.
 */
function parseFlightSearch(raw: string): {
  origin: string;
  destination: string;
  departDate: string | null;
  returnDate: string | null;
} {
  const EMPTY = { origin: "", destination: "", departDate: null, returnDate: null };
  if (!raw) return EMPTY;

  // Each segment: 3-letter IATA + 4-digit DDMM
  const segments = [...raw.matchAll(/([A-Z]{3})(\d{2})(\d{2})/g)];
  if (segments.length < 1) return EMPTY;

  const year = new Date().getFullYear();

  function toIso(dd: string, mm: string): string {
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    if (d < 1 || d > 31 || m < 1 || m > 12) return "";
    return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const origin = segments[0][1];
  const departDate = toIso(segments[0][2], segments[0][3]);

  // Destination: the 3-letter code right after the first 4 digits
  const destMatch = raw.match(/^[A-Z]{3}\d{4}([A-Z]{3})/);
  const destination = destMatch?.[1] ?? "";

  // Return date: second segment's date (if present)
  const returnDate = segments.length >= 2 ? toIso(segments[1][2], segments[1][3]) : null;

  return { origin, destination, departDate, returnDate };
}

function buildInitFromQuery(search: URLSearchParams) {
  // Try plain params first; fall back to compact format
  let origin = safeParam(search.get("origin"));
  let destination = safeParam(search.get("destination"));
  let departDate = safeParam(search.get("depart"));
  let returnDate = safeParam(search.get("return"));

  if (!origin || !destination) {
    const parsed = parseFlightSearch(safeParam(search.get("flightSearch")));
    if (!origin) origin = parsed.origin;
    if (!destination) destination = parsed.destination;
    if (!departDate) departDate = parsed.departDate ?? "";
    if (!returnDate) returnDate = parsed.returnDate ?? "";
  }

  const tripType = safeParam(search.get("tripType"), "roundtrip");
  const adults = Number(search.get("adults") || 1);
  const children = Number(search.get("children") || 0);
  const infants = Number(search.get("infants") || 0);

  const init: Record<string, unknown> = {};
  if (origin) init.origin = { iata: origin.toUpperCase(), name: origin.toUpperCase() };
  if (destination)
    init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  if (departDate) init.departDate = departDate;
  if (tripType === "one-way" || !returnDate) {
    init.oneWay = true;
  } else if (returnDate) {
    init.returnDate = returnDate;
  }
  init.passengers = {
    adults: adults > 0 ? adults : 1,
    children: children > 0 ? children : 0,
    infants: infants > 0 ? infants : 0,
  };
  return init;
}

function hasRenderedWeedles(container: HTMLElement | null): boolean {
  if (!container) return false;
  const weedles = Array.from(container.querySelectorAll<HTMLElement>(".tpwl-widget-weedle"));
  if (!weedles.length) return false;
  return weedles.some(
    (w) =>
      Array.from(w.children).some(
        (c) => !(c instanceof HTMLScriptElement) && c.textContent?.trim() !== "",
      ) || w.querySelector("iframe,a,img,[class*='tpwl'],[data-tpwl-rendered='true']") !== null,
  );
}

function buildFallbackUrl(origin: string, dest: string) {
  return `/flights/results?${new URLSearchParams({ origin, destination: dest })}`;
}

function GtaLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="7" fill="#3D0870" />
      <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M6 27 Q10 9 27 8" stroke="#F5A623" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z" fill="#F5A623" />
      <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#fff" letterSpacing="-0.5">GO</text>
    </svg>
  );
}

export default function FlightResults() {
  const search       = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeLabel   = useMemo(() => getRouteLabel(search), [search]);
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");
  const fallbackOrigin = useMemo(
    () => safeParam(search.get("origin"), "BKK").toUpperCase() || "BKK",
    [search],
  );

  const parsedSearch = useMemo(() => {
    const plainDest = normalizeCode(
      search.get("destination") ||
        search.get("to") ||
        search.get("destinationCode") ||
        search.get("arrival"),
    );
    const plainDepart = safeIsoDate(
      search.get("depart") ||
        search.get("departureDate") ||
        search.get("dateFrom") ||
        search.get("startDate"),
    );
    const plainReturn = safeIsoDate(
      search.get("return") ||
        search.get("returnDate") ||
        search.get("dateTo") ||
        search.get("endDate"),
    );

    if (plainDest) {
      return { destination: plainDest, departDate: plainDepart, returnDate: plainReturn };
    }

    const fs = safeParam(search.get("flightSearch"));
    const parsed = parseFlightSearch(fs);
    return {
      destination: parsed.destination,
      departDate: parsed.departDate,
      returnDate: parsed.returnDate,
    };
  }, [search]);

  const destinationCode = parsedSearch.destination;
  const departDate = parsedSearch.departDate;
  const returnDate = parsedSearch.returnDate;

  const cityName = useMemo(() => {
    return getCityName(destinationCode);
  }, [destinationCode]);

  const adults = useMemo(() => {
    const raw = Number(search.get("adults") || 1);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [search]);

  useEffect(() => {
    console.debug("[GTA] parsed →", { destinationCode, cityName, departDate, returnDate });
    // ── Cleanup previous run ─────────────────────────────
    document.getElementById(SCRIPT_ID)?.remove();
    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    document.getElementById("tpwl-search")?.replaceChildren();
    document.getElementById("tpwl-tickets")?.replaceChildren();
    document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    setWidgetState("loading");

    // ── Travelpayouts global config ──────────────────────
    window.TPWL_CONFIGURATION = {
      ...window.TPWL_CONFIGURATION,
      resultsURL: `${window.location.origin}/flights/results`,
      marker: TP_MARKER,
      init: buildInitFromQuery(search),
    };

    window.TPWL_EXTRA = {
      ...(window.TPWL_EXTRA || {}),
      currency: "THB",
      trs: "",
      marker: TP_MARKER,
      domain: window.location.hostname,
      locale: "en",
      link_color: "F5A623",
    };

    // ── Load main Travelpayouts widget script ────────────
    const mainScript = document.createElement("script");
    mainScript.id    = SCRIPT_ID;
    mainScript.async = true;
    mainScript.type  = "module";
    mainScript.src   = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    // ── Mount weedle popular destination scripts ─────────
    const mountWeedles = () => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (!container) return;
      container.querySelectorAll<HTMLElement>("div[data-destination]").forEach((el) => {
        el.innerHTML = "";
        const destination = el.dataset.destination;
        if (!destination || !window.TPWL_EXTRA) return;
        const e = window.TPWL_EXTRA;
        const s = document.createElement("script");
        s.async     = true;
        s.className = WEEDLE_SCRIPT_CLASS;
        s.src =
          `https://tpwidg.com/content` +
          `?currency=${String(e.currency ?? "THB").toLowerCase()}` +
          `&trs=${encodeURIComponent(String(e.trs ?? ""))}` +
          `&shmarker=${encodeURIComponent(String(e.marker ?? TP_MARKER))}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&target_host=${encodeURIComponent(String(e.domain ?? window.location.hostname))}` +
          `&locale=${encodeURIComponent(String(e.locale ?? "en"))}` +
          `&limit=6&powered_by=false` +
          `&primary=%23F5A623` +
          `&promo_id=4044&campaign_id=100`;
        el.appendChild(s);
      });
    };

    const mountTimer = window.setTimeout(mountWeedles, 1200);

    // ── Poll until weedles render or timeout ─────────────
    const pollStart = Date.now();
    const pollTimer = window.setInterval(() => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (hasRenderedWeedles(container)) {
        setWidgetState("ready");
        window.clearInterval(pollTimer);
        return;
      }
      if (Date.now() - pollStart >= WEEDLE_TIMEOUT_MS) {
        setWidgetState("fallback");
        window.clearInterval(pollTimer);
      }
    }, WEEDLE_POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(mountTimer);
      window.clearInterval(pollTimer);
      document.getElementById(SCRIPT_ID)?.remove();
      document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
      document.getElementById("tpwl-search")?.replaceChildren();
      document.getElementById("tpwl-tickets")?.replaceChildren();
      document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    };
  }, [search]);

  return (
    <>
      <SEO
        title={`Cheap Flights${routeLabel ? ` ${routeLabel}` : ""} | GoTravelAsia`}
        description="Compare hundreds of airlines to find the cheapest flights across Southeast Asia."
      />

      <style>{`
        /* ═══════════════════════════════════════════════════
           GoTravelAsia — Flight Results Page
           Layout:
             1. Gold toolbar (logo + TP search widget)
             2. TP results widget — full viewport width
             3. Popular destinations grid
             4. Footer
           No static filters. No fake prices.
        ═══════════════════════════════════════════════════ */

        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --gold:        #F5A623;
          --gold-dark:   #D4881A;
          --purple:      #5B0FA8;
          --purple-dark: #3D0870;
          --navy:        #00162b;
          --gray-50:     #f5f7fa;
          --gray-100:    #edf0f5;
          --gray-200:    #dde2ec;
          --gray-400:    #8f9bb3;
          --gray-600:    #4a566d;
          --white:       #ffffff;

          /* Travelpayouts CSS variable overrides */
          --tpwl-font-family:              "Plus Jakarta Sans", system-ui, sans-serif;
          --tpwl-main-text:                #00162b;
          --tpwl-search-result-background: #f5f7fa;
          --tpwl-search-form-background:   #3D0870;
          --tpwl-headline-text:            #ffffff;
          --tpwl-links:                    #F5A623;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          font-family: var(--tpwl-font-family), sans-serif;
          color: var(--navy);
          background: var(--gray-50);
          -webkit-font-smoothing: antialiased;
        }

        body a {
          color: var(--gold);
          text-decoration: none;
          transition: color 0.12s;
        }
        body a:hover { color: var(--gold-dark); text-decoration: underline; }

        /* ── Hide Travelpayouts branding ────────────────── */
        a[href*="travelpayouts"]:not(.gta-logo),
        [class*="powered-by"], [class*="poweredBy"],
        [class*="powered_by"], [class*="PoweredBy"],
        [class*="tpwl-powered"], span[class*="powered"] {
          display: none !important;
        }

        /* ── Hide TP's own hero header and search band ──── */
        .tpwl-logo-header   { display: none !important; }
        .tpwl-search-header { display: none !important; }

        /* ═══════════════════════════════════════════════════
           TOOLBAR — gold band
           Row 1: Logo | route | actions  (48px)
           Row 2: Travelpayouts search widget (auto height)
        ═══════════════════════════════════════════════════ */
        .gta-toolbar {
          position: sticky;
          top: 0;
          z-index: 400;
          background: var(--gold);
          box-shadow: 0 2px 8px rgba(0,0,0,.15);
          padding: 0 24px 14px;
        }

        /* ── Top row: logo + actions ────────────────────── */
        .gta-toolbar__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
        }

        .gta-toolbar__left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gta-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .gta-logo__text {
          font-weight: 800;
          font-size: 15px;
          color: var(--purple-dark);
          letter-spacing: -0.03em;
        }
        .gta-logo__text b { color: var(--purple); }

        .gta-back {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--purple-dark);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 6px;
          transition: background 0.12s;
        }
        .gta-back:hover {
          background: rgba(61,8,112,.12);
          text-decoration: none;
          color: var(--purple-dark);
        }

        .gta-toolbar__divider {
          width: 1px; height: 18px;
          background: rgba(61,8,112,.2);
        }

        .gta-toolbar__route {
          font-size: 13px;
          font-weight: 700;
          color: var(--purple-dark);
        }

        .gta-toolbar__right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gta-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap;
        }
        .gta-btn--outline {
          border: 1.5px solid rgba(61,8,112,.3);
          color: var(--purple-dark);
          background: transparent;
        }
        .gta-btn--outline:hover {
          background: rgba(61,8,112,.1);
          text-decoration: none;
          color: var(--purple-dark);
        }
        .gta-btn--dark {
          background: var(--purple-dark);
          color: var(--gold);
          border: none;
        }
        .gta-btn--dark:hover {
          background: var(--purple);
          text-decoration: none;
          color: var(--gold);
        }

        /* ── Search widget row ──────────────────────────── */
        .gta-toolbar__search {
          width: 100%;
        }

        #tpwl-search {
          width: 100%;
          overflow: visible;
        }

        /* TP dropdowns must sit above everything */
        [class*="Dropdown"], [class*="dropdown"],
        [class*="Popup"],    [class*="popup"],
        [class*="Calendar"], [class*="calendar"],
        [class*="Suggest"],  [class*="suggest"] {
          z-index: 500 !important;
        }

        /* ═══════════════════════════════════════════════════
           RESULTS AREA — full width, TP controls layout
        ═══════════════════════════════════════════════════ */
        .tpwl-main {
          background: var(--gray-50) !important;
          min-height: 60vh;
        }

        .tpwl-tickets__wrapper {
          display: block !important;
          max-width: 1280px !important;
          margin: 0 auto !important;
          padding: 16px 24px 0 !important;
        }

        .tpwl__content {
          flex: 1 0 auto;
          max-width: 1280px;
          min-width: 976px;
        }

        /* ── Minimal ticket card polish ──────────────────── */
        [class*="ticket"]:not([class*="tpwl-widget"]),
        [class*="Ticket"]:not([class*="tpwl-widget"]) {
          margin-bottom: 8px !important;
        }

        /* CTA buttons — brand gold */
        [class*="buy"], [class*="Buy"],
        [class*="book"], [class*="Book"],
        [class*="select"], [class*="Select"],
        [class*="BuyButton"] {
          background: var(--gold) !important;
          color: var(--navy) !important;
          font-weight: 800 !important;
          border: none !important;
          transition: background 0.12s !important;
        }
        [class*="buy"]:hover, [class*="Buy"]:hover,
        [class*="select"]:hover, [class*="Select"]:hover {
          background: var(--gold-dark) !important;
        }

        /* ═══════════════════════════════════════════════════
           POPULAR DESTINATIONS
        ═══════════════════════════════════════════════════ */
        .tpwl-widgets__wrapper { display: none !important; }

        .gta-explore {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 56px;
        }

        .gta-explore__header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .gta-explore__title {
          font-size: 18px;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: -0.02em;
        }
        .gta-explore__link {
          font-size: 13px;
          font-weight: 600;
          color: var(--purple);
        }
        .gta-explore__link:hover { text-decoration: underline; color: var(--purple); }

        .gta-dest-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .gta-dest-card {
          background: var(--white);
          border: 1.5px solid var(--gray-200);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 110px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .gta-dest-card:hover {
          border-color: var(--purple);
          box-shadow: 0 6px 20px rgba(91,15,168,.12);
          transform: translateY(-2px);
          text-decoration: none;
          color: inherit;
        }
        .gta-dest-card__iata {
          font-size: 10px;
          font-weight: 800;
          color: var(--purple);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .gta-dest-card__city {
          font-size: 14px;
          font-weight: 700;
          color: var(--navy);
          margin-top: 3px;
        }
        .gta-dest-card__country {
          font-size: 11px;
          color: var(--gray-400);
          margin-top: 1px;
        }
        .gta-dest-card__cta {
          font-size: 11px;
          font-weight: 700;
          color: var(--gold-dark);
          margin-top: 10px;
        }

        /* Live weedle grid */
        #tpwl-widget-weedles {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        .tpwl-widget-weedle {
          display: flex;
          justify-content: center;
          min-height: 110px;
        }

        /* Skeleton loading */
        .gta-skel {
          background: var(--white);
          border: 1.5px solid var(--gray-200);
          border-radius: 10px;
          min-height: 110px;
          animation: skel-pulse 1.4s ease-in-out infinite;
        }
        @keyframes skel-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* ═══════════════════════════════════════════════════
           FOOTER
        ═══════════════════════════════════════════════════ */
        .gta-footer {
          background: var(--purple-dark);
          color: rgba(255,255,255,.4);
          padding: 36px 24px;
          font-size: 13px;
          text-align: center;
        }

        .gta-footer__inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .gta-footer__copyright {
          margin-bottom: 12px;
        }

        .gta-footer__links {
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        .gta-footer__links a {
          color: rgba(255,255,255,.35);
        }
        .gta-footer__links a:hover {
          color: var(--gold);
          text-decoration: none;
        }

        /* ═══ RESPONSIVE ═══════════════════════════════════ */
        @media (max-width: 1024px) {
          .tpwl__content { max-width: unset; min-width: unset; }
          .gta-dest-grid,
          #tpwl-widget-weedles { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .gta-toolbar { padding: 0 16px 10px; }
          .gta-toolbar__top { height: 44px; }
          .gta-toolbar__route { display: none; }
          .gta-toolbar__divider { display: none; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-tickets__wrapper { padding: 12px 16px 0 !important; }
          .gta-explore { padding: 28px 16px 40px; }
          .gta-dest-grid,
          #tpwl-widget-weedles { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .gta-logo__text { display: none; }
          .gta-btn--outline { display: none; }
          .gta-footer { padding: 28px 16px; }
          .gta-footer__links { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div className="tpwl-page">

        {/* ══ TOOLBAR — gold bar with TP search inside ═════ */}
        <div className="gta-toolbar" role="banner">

          {/* Top row */}
          <div className="gta-toolbar__top">
            <div className="gta-toolbar__left">
              <a href="/" className="gta-back" aria-label="Back to GoTravel Asia">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </a>

              <a href="/" className="gta-logo" aria-label="GoTravel Asia home">
                <GtaLogo size={28} />
                <span className="gta-logo__text">GO<b>TRAVEL</b> ASIA</span>
              </a>

              {routeLabel && (
                <>
                  <div className="gta-toolbar__divider" />
                  <span className="gta-toolbar__route">{routeLabel}</span>
                </>
              )}
            </div>

            <div className="gta-toolbar__right">
              <a href="#" className="gta-btn gta-btn--outline" target="_blank" rel="noopener noreferrer">
                🔔 Price Alerts
              </a>
              <a href="/" className="gta-btn gta-btn--dark">
                New Search
              </a>
            </div>
          </div>

          {/* Search widget row — Travelpayouts renders here */}
          <div className="gta-toolbar__search">
            <div id="tpwl-search" />
          </div>
        </div>

        {/* ══ RESULTS — Travelpayouts controls this ════════ */}
        <main className="tpwl-main">
          <div className="tpwl-tickets__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-tickets" />
            </div>
          </div>

          <ErrorBoundary fallback={<div className="text-sm text-neutral-500">Hotel previews currently unavailable</div>}>
            <StaysSection
              cityName={cityName}
              destinationCode={destinationCode}
              checkIn={departDate}
              checkOut={returnDate}
              adults={adults}
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="text-sm text-neutral-500">Car rental previews currently unavailable</div>}>
            <CarsSection
              cityName={cityName}
              airportCode={destinationCode}
              pickupDate={departDate}
              returnDate={returnDate}
            />
          </ErrorBoundary>

          {/* ══ POPULAR DESTINATIONS ═══════════════════════ */}
          <section aria-labelledby="gta-explore-heading">
            <div className="gta-explore">
              <div className="gta-explore__header">
                <h2 id="gta-explore-heading" className="gta-explore__title">
                  Popular destinations
                </h2>
                <a href="/flights" className="gta-explore__link">See all →</a>
              </div>

              {widgetState === "loading" && (
                <div className="gta-dest-grid" aria-busy="true" aria-label="Loading popular destinations">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <div key={d.code} className="gta-skel" />
                  ))}
                </div>
              )}

              {widgetState === "fallback" && (
                <div className="gta-dest-grid">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <a key={d.code} href={buildFallbackUrl(fallbackOrigin, d.code)} className="gta-dest-card">
                      <div>
                        <div className="gta-dest-card__iata">{d.code}</div>
                        <div className="gta-dest-card__city">{d.city}</div>
                        <div className="gta-dest-card__country">{d.country}</div>
                      </div>
                      <div className="gta-dest-card__cta">Search flights →</div>
                    </a>
                  ))}
                </div>
              )}

              <div
                id="tpwl-widget-weedles"
                hidden={widgetState !== "ready"}
                aria-hidden={widgetState !== "ready"}
              >
                {POPULAR_DESTINATIONS.map((d) => (
                  <div key={d.code} className="tpwl-widget-weedle" data-destination={d.code} />
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ══ FOOTER ═══════════════════════════════════════ */}
        <footer className="gta-footer">
          <div className="gta-footer__inner">
            <div className="gta-footer__copyright">
              © {new Date().getFullYear()} GoTravel Asia
            </div>
            <div className="gta-footer__links">
              <a href="/terms"   target="_blank" rel="noreferrer">Terms</a>
              <a href="/privacy" target="_blank" rel="noreferrer">Privacy</a>
              <a href="/cookies" target="_blank" rel="noreferrer">Cookies</a>
            </div>
          </div>
        </footer>

        <div id="tpwl-cookie-banner" className="tpwl-cookie-banner" />
      </div>
    </>
  );
}
