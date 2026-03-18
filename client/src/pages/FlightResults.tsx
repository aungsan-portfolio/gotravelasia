import { useEffect, useMemo, useState } from "react";
import SEO from "@/seo/SEO";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: Record<string, any>;
    TPWL_EXTRA?: Record<string, any>;
  }
}

const WL_ID = "12942";
const TP_MARKER = "697202";
const SCRIPT_ID = "tpwl-main-script";
const WEEDLE_SCRIPT_CLASS = "tpwl-weedle-script";
const WEEDLE_POLL_INTERVAL_MS = 300;
const WEEDLE_TIMEOUT_MS = 6000;

type WidgetState = "loading" | "ready" | "fallback";

type PopularDestination = {
  code: string;
  city: string;
  country: string;
};

// ── CHANGE 1: SEA destinations replacing IST/DXB/MOW/LAS/NYC/LON ──────────
const POPULAR_DESTINATIONS: PopularDestination[] = [
  { code: "SIN", city: "Singapore",   country: "Singapore" },
  { code: "BKK", city: "Bangkok",     country: "Thailand" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "HAN", city: "Hanoi",       country: "Vietnam" },
  { code: "DPS", city: "Bali",        country: "Indonesia" },
  { code: "HKT", city: "Phuket",      country: "Thailand" },
];

function safeParam(value: string | null, fallback = ""): string {
  return value ? decodeURIComponent(value) : fallback;
}

function getRouteInfo(search: URLSearchParams) {
  const origin = safeParam(search.get("origin"));
  const destination = safeParam(search.get("destination"));
  if (origin && destination) {
    return ` from ${origin.toUpperCase()} to ${destination.toUpperCase()}`;
  }
  return safeParam(search.get("flightSearch")) ? "" : "";
}

function buildInitFromQuery(search: URLSearchParams) {
  const origin = safeParam(search.get("origin"));
  const destination = safeParam(search.get("destination"));
  const departDate = safeParam(search.get("depart"));
  const returnDate = safeParam(search.get("return"));
  const tripType = safeParam(search.get("tripType"), "return");
  const adults = Number(search.get("adults") || 1);
  const children = Number(search.get("children") || 0);
  const infants = Number(search.get("infants") || 0);

  const init: Record<string, unknown> = {};

  if (origin) init.origin = { iata: origin.toUpperCase(), name: origin.toUpperCase() };
  if (destination) init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  if (departDate) init.departDate = departDate;

  if (tripType === "one-way") {
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
  if (weedles.length === 0) return false;
  return weedles.some((weedle) =>
    Array.from(weedle.children).some(
      (child) => !(child instanceof HTMLScriptElement) && child.textContent?.trim() !== "",
    ) || weedle.querySelector("iframe, a, img, [class*='tpwl'], [data-tpwl-rendered='true']") !== null,
  );
}

function buildFallbackDestinationUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({ origin, destination });
  return `/flights/results?${params.toString()}`;
}

// ── GoTravel Asia inline logo SVG ──────────────────────────────────────────
function GoTravelLogo() {
  return (
    <a href="/" aria-label="GoTravel Asia home" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="34" height="34" rx="7" fill="#3D0870"/>
        <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        <path d="M6 27 Q10 9 27 8" stroke="#F5A623" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
        <path d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z" fill="#F5A623"/>
        <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#FFFFFF" letterSpacing="-0.5">GO</text>
      </svg>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "17px",
        color: "#3D0870",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        GO<span style={{ color: "#5B0FA8" }}>TRAVEL</span> ASIA
      </span>
    </a>
  );
}

export default function FlightResults() {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeInfo = useMemo(() => getRouteInfo(search), [search]);
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");
  const fallbackOrigin = useMemo(() => safeParam(search.get("origin"), "BKK").toUpperCase() || "BKK", [search]);

  useEffect(() => {
    const oldScript = document.getElementById(SCRIPT_ID);
    if (oldScript) oldScript.remove();

    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    document.getElementById("tpwl-search")?.replaceChildren();
    document.getElementById("tpwl-tickets")?.replaceChildren();
    document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    setWidgetState("loading");

    const init = buildInitFromQuery(search);

    window.TPWL_CONFIGURATION = {
      ...window.TPWL_CONFIGURATION,
      resultsURL: `${window.location.origin}/flights/results`,
      marker: TP_MARKER,
      init,
    };

    // ── CHANGE 2: link_color → GoTravel Asia gold ──────────────────────────
    window.TPWL_EXTRA = {
      ...(window.TPWL_EXTRA || {}),
      currency: "USD",
      trs: "",
      marker: TP_MARKER,
      domain: window.location.hostname,
      locale: "en",
      link_color: "F5A623",  // ← Gold (was "5B7CFF" indigo)
    };

    const mainScript = document.createElement("script");
    mainScript.id = SCRIPT_ID;
    mainScript.async = true;
    mainScript.type = "module";
    mainScript.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    const mountWeedles = () => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (!container) return;

      const weedleElements = container.querySelectorAll<HTMLElement>('div[data-destination]');
      weedleElements.forEach((element) => {
        element.innerHTML = "";
        const destination = element.dataset.destination;
        if (!destination || !window.TPWL_EXTRA) return;

        const marker    = String(window.TPWL_EXTRA.marker    ?? TP_MARKER);
        const currency  = String(window.TPWL_EXTRA.currency  ?? "USD").toLowerCase();
        const trs       = String(window.TPWL_EXTRA.trs       ?? "");
        const domain    = String(window.TPWL_EXTRA.domain    ?? window.location.hostname);
        const locale    = String(window.TPWL_EXTRA.locale    ?? "en");
        const linkColor = String(window.TPWL_EXTRA.link_color ?? "F5A623");

        const scriptElement = document.createElement("script");
        scriptElement.async = true;
        scriptElement.className = WEEDLE_SCRIPT_CLASS;
        scriptElement.src =
          `https://tpwidg.com/content` +
          `?currency=${currency}` +
          `&trs=${encodeURIComponent(trs)}` +
          `&shmarker=${encodeURIComponent(marker)}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&target_host=${encodeURIComponent(domain)}` +
          `&locale=${encodeURIComponent(locale)}` +
          `&limit=6` +
          `&powered_by=false` +
          `&primary=%23${linkColor}` +
          `&promo_id=4044` +
          `&campaign_id=100`;

        element.appendChild(scriptElement);
      });
    };

    const mountTimer = window.setTimeout(mountWeedles, 1200);
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
      const script = document.getElementById(SCRIPT_ID);
      if (script) script.remove();
      document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
      document.getElementById("tpwl-search")?.replaceChildren();
      document.getElementById("tpwl-tickets")?.replaceChildren();
      document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    };
  }, [search]);

  return (
    <>
      <SEO
        title={`Search Flights${routeInfo} | GoTravelAsia`}
        description="We search hundreds of travel sites at once to find the cheapest flights for you."
      />

      {/* ── CHANGE 3: CSS variables + styles → GoTravel Asia brand ───────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          /* GoTravel Asia brand tokens */
          --gta-purple:      #5B0FA8;
          --gta-purple-dark: #3D0870;
          --gta-gold:        #F5A623;
          --gta-off-white:   #F7F4FF;
          --gta-muted:       #9B7FCC;

          /* Travelpayouts CSS variable overrides */
          --tpwl-font-family:              "DM Sans", system-ui, sans-serif;
          --tpwl-main-text:                #1A0A33;
          --tpwl-search-result-background: #F7F4FF;
          --tpwl-search-form-background:   #3D0870;
          --tpwl-headline-text:            #FFFFFF;
          --tpwl-links:                    #F5A623;
        }

        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          color: var(--tpwl-main-text);
          background-color: var(--tpwl-search-result-background);
          font-family: var(--tpwl-font-family), sans-serif;
        }

        body a {
          color: var(--tpwl-links);
          text-decoration: none;
          cursor: pointer;
          transition: 0.15s linear;
        }

        body a:hover,
        body a:focus {
          opacity: 0.82;
          text-decoration: underline;
        }

        /* ── Navbar ──────────────────────────────────────── */
        .gta-navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--gta-gold);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 56px;
          box-shadow: 0 2px 16px rgba(61,8,112,.22);
        }

        .gta-navbar__left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .gta-back {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gta-purple-dark);
          text-decoration: none;
          letter-spacing: .02em;
        }

        .gta-back:hover { opacity: .72; text-decoration: none; }

        .gta-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 2px solid var(--gta-purple-dark);
          font-size: 13px;
          font-weight: 700;
          color: var(--gta-purple-dark);
          background: transparent;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: .02em;
          transition: background .15s, color .15s;
        }

        .gta-nav-cta:hover {
          background: var(--gta-purple-dark);
          color: var(--gta-gold);
          text-decoration: none;
          opacity: 1;
        }

        /* ── Hero header ─────────────────────────────────── */
        .tpwl-logo-header {
          position: relative;
          color: var(--tpwl-headline-text);
          font-weight: 600;
          background-color: var(--tpwl-search-form-background);
          padding: 52px 100px 22px;
          margin-bottom: -20px;
          z-index: 101;
          overflow: hidden;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* Decorative circles in hero */
        .tpwl-logo-header::before {
          content: "";
          position: absolute;
          top: -80px; right: -80px;
          width: 380px; height: 380px;
          border-radius: 50%;
          border: 56px solid rgba(245,166,35,.10);
          pointer-events: none;
        }

        .tpwl-logo-header::after {
          content: "";
          position: absolute;
          bottom: -60px; left: 40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 32px solid rgba(245,166,35,.07);
          pointer-events: none;
        }

        .tpwl-hero__inner { position: relative; z-index: 1; }

        .tpwl-logo-header h1 {
          font-family: "Syne", sans-serif;
          font-size: 46px;
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #FFFFFF;
        }

        .tpwl-hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,.6);
          margin-bottom: 22px;
        }

        .tpwl-hero-badges {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
        }

        .tpwl-hero-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--gta-gold);
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        /* ── Sticky search bar ───────────────────────────── */
        .tpwl-search-header {
          padding: 20px 100px 26px;
          background-color: var(--tpwl-search-form-background);
          position: sticky;
          top: 56px;  /* below navbar */
          z-index: 100;
          transition: all 0.3s linear;
          border-bottom: 1px solid rgba(245,166,35,.18);
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .tpwl-search__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tpwl__content {
          flex: 1 0 auto;
          max-width: 1240px;
          min-width: 976px;
        }

        /* ── Results area ────────────────────────────────── */
        .tpwl-main {
          background-color: var(--tpwl-search-result-background);
        }

        .tpwl-tickets__wrapper #tpwl-tickets:not(:empty) {
          margin-bottom: 32px;
        }

        .tpwl-tickets__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 100px;
        }

        /* ── Popular destinations ────────────────────────── */
        .tpwl-widgets__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 100px;
          margin-bottom: 0;
          background: #FFFFFF;
          border-top: 1px solid rgba(91,15,168,.08);
        }

        .tpwl-widgets__wrapper h3 {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          text-align: center;
          font-size: 30px;
          margin: 0 0 6px;
          color: var(--gta-purple-dark);
          letter-spacing: -0.02em;
        }

        .tpwl-dest-sub {
          text-align: center;
          color: var(--gta-muted);
          font-size: 14px;
          margin-bottom: 36px;
        }

        .tpwl-widget-weedles {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .tpwl-widget-weedle {
          display: flex;
          justify-content: center;
          min-height: 220px;
        }

        .tpwl-widget-state,
        .tpwl-widget-fallback {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .tpwl-widget-skeleton,
        .tpwl-widget-card {
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid rgba(91,15,168,.12);
          box-shadow: 0 8px 24px rgba(61,8,112,.07);
        }

        .tpwl-widget-skeleton {
          min-height: 220px;
          padding: 24px;
          animation: tpwl-pulse 1.6s ease-in-out infinite;
        }

        .tpwl-widget-skeleton::before,
        .tpwl-widget-skeleton::after {
          content: "";
          display: block;
          border-radius: 999px;
          background: linear-gradient(90deg, #ede5ff, #f7f4ff, #ede5ff);
          background-size: 200% 100%;
          animation: tpwl-shimmer 1.6s linear infinite;
        }

        .tpwl-widget-skeleton::before {
          width: 65%; height: 18px; margin-bottom: 18px;
        }

        .tpwl-widget-skeleton::after {
          width: 40%; height: 14px;
        }

        .tpwl-widget-message {
          margin: 0 0 20px;
          text-align: center;
          color: var(--gta-muted);
        }

        .tpwl-widget-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
          padding: 24px;
          color: inherit;
          transition: box-shadow .2s, transform .2s;
        }

        .tpwl-widget-card:hover {
          box-shadow: 0 12px 32px rgba(91,15,168,.15);
          transform: translateY(-2px);
          text-decoration: none;
          opacity: 1;
        }

        .tpwl-widget-card__code {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gta-purple);
        }

        .tpwl-widget-card__city {
          margin: 10px 0 5px;
          font-size: 26px;
          font-weight: 700;
          color: var(--gta-purple-dark);
          font-family: "Syne", sans-serif;
        }

        .tpwl-widget-card__country {
          margin: 0;
          color: var(--gta-muted);
          font-size: 14px;
        }

        .tpwl-widget-card__cta {
          margin-top: 24px;
          font-weight: 700;
          color: var(--gta-gold);
          font-size: 14px;
        }

        .tpwl-widget-container[hidden] {
          display: none;
        }

        @media (max-width: 389px) {
          .tpwl-footer__wrapper { padding: 40px 16px; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-footer__copyright { margin-bottom: 16px; }
          .tpwl-footer__links { flex-direction: column; gap: 10px; }
        }

        @media (max-width: 600px) {
          .gta-navbar { padding: 0 16px; }
          .gta-back span { display: none; }
        }

        @media (max-width: 1175px) {
          .tpwl-logo-header { position: static; padding: 40px 16px 16px; margin-bottom: 0; }
          .tpwl-logo-header h1 { font-size: 30px; max-width: 480px; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-search__wrapper { display: block; }
          .tpwl-search-header { padding: 16px; position: static; }
          .tpwl-tickets__wrapper { padding: 0 16px; }
          .tpwl-widgets__wrapper { padding: 48px 16px; }
          .tpwl-widgets__wrapper h3 { font-size: 26px; }
          .tpwl-widgets__wrapper .tpwl__content { flex: 1 0 100%; }
          .tpwl-widget-weedles,
          .tpwl-widget-state,
          .tpwl-widget-fallback { grid-template-columns: 1fr; }
          .tpwl-footer__wrapper { padding: 40px 16px; }
          .tpwl-footer__wrapper .tpwl__content { flex: 1 1 auto; }
        }
      `}</style>

      <div className="tpwl-page">

        {/* ── CHANGE 4: Navbar — gold bar with GoTravel Asia logo ── */}
        <nav className="gta-navbar" role="navigation" aria-label="Main navigation">
          <div className="gta-navbar__left">
            <a href="/" className="gta-back" aria-label="Back to GoTravel Asia">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back to Explorer</span>
            </a>
            <GoTravelLogo />
          </div>
          <a href="#" className="gta-nav-cta" target="_blank" rel="noopener noreferrer">
            🔔 Price Alerts
          </a>
        </nav>

        {/* ── Hero ────────────────────────────────────────── */}
        <header className="tpwl-logo-header">
          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <div className="tpwl-hero__inner">
                <h1>Your journey begins here.</h1>
                <p className="tpwl-hero-sub">Crafting unforgettable journeys across Southeast Asia and beyond.</p>
                <div className="tpwl-hero-badges">
                  <span className="tpwl-hero-badge">✦ 100+ booking sites</span>
                  <span className="tpwl-hero-badge">⏱ Live updates</span>
                  <span className="tpwl-hero-badge">✓ Best price guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Search form ─────────────────────────────────── */}
        <header className="tpwl-search-header">
          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-search" />
            </div>
          </div>
        </header>

        {/* ── Results + Popular destinations ──────────────── */}
        <main className="tpwl-main">
          <div className="tpwl-tickets__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-tickets" />
            </div>
          </div>

          <div className="tpwl-widgets__wrapper">
            <div className="tpwl__content">
              <h3>Popular Destinations</h3>
              <p className="tpwl-dest-sub">Top routes from Southeast Asia</p>

              {widgetState === "loading" && (
                <div className="tpwl-widget-state" aria-live="polite" aria-busy="true">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <div key={d.code} className="tpwl-widget-skeleton" />
                  ))}
                </div>
              )}

              {widgetState === "fallback" && (
                <>
                  <p className="tpwl-widget-message" role="status">
                    Popular destination widgets are temporarily unavailable. Here are direct flight search links instead.
                  </p>
                  <div className="tpwl-widget-fallback">
                    {POPULAR_DESTINATIONS.map((d) => (
                      <a
                        key={d.code}
                        href={buildFallbackDestinationUrl(fallbackOrigin, d.code)}
                        className="tpwl-widget-card"
                      >
                        <div>
                          <span className="tpwl-widget-card__code">{d.code}</span>
                          <h4 className="tpwl-widget-card__city">{d.city}</h4>
                          <p className="tpwl-widget-card__country">{d.country}</p>
                        </div>
                        <span className="tpwl-widget-card__cta">Search flights →</span>
                      </a>
                    ))}
                  </div>
                </>
              )}

              <div
                id="tpwl-widget-weedles"
                className="tpwl-widget-weedles tpwl-widget-container"
                hidden={widgetState !== "ready"}
                aria-hidden={widgetState !== "ready"}
              >
                {POPULAR_DESTINATIONS.map((d) => (
                  <div key={d.code} className="tpwl-widget-weedle" data-destination={d.code} />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="tpwl-footer__wrapper">
          <div className="tpwl__content">
            <div className="tpwl-footer__brand">
              <svg width="26" height="26" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <rect width="34" height="34" rx="7" fill="#5B0FA8"/>
                <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#FFFFFF" letterSpacing="-0.5">GO</text>
              </svg>
              <div className="tpwl-footer__brand-name">GoTravel Asia</div>
            </div>
            <p className="tpwl-footer__tagline">Crafting Unforgettable Journeys</p>
            <div className="tpwl-footer__copyright">
              Powered by Travelpayouts © 2008–{new Date().getFullYear()}
            </div>
            <div className="tpwl-footer__links">
              <a href="/terms"   target="_blank" rel="noreferrer">Terms of Service</a>
              <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
              <a href="/cookies" target="_blank" rel="noreferrer">Cookie Policy</a>
            </div>
          </div>
        </footer>

        <div id="tpwl-cookie-banner" className="tpwl-cookie-banner" />
      </div>
    </>
  );
}
