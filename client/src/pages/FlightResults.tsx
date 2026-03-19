import { useEffect, useMemo, useState } from "react";
import SEO from "@/seo/SEO";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: Record<string, any>;
    TPWL_EXTRA?: Record<string, any>;
  }
}

const WL_ID    = "12942";
const TP_MARKER = "697202";
const SCRIPT_ID = "tpwl-main-script";
const WEEDLE_SCRIPT_CLASS   = "tpwl-weedle-script";
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

function getRouteInfo(search: URLSearchParams) {
  const o = safeParam(search.get("origin"));
  const d = safeParam(search.get("destination"));
  return o && d ? ` ${o.toUpperCase()} → ${d.toUpperCase()}` : "";
}

function buildInitFromQuery(search: URLSearchParams) {
  const origin      = safeParam(search.get("origin"));
  const destination = safeParam(search.get("destination"));
  const departDate  = safeParam(search.get("depart"));
  const returnDate  = safeParam(search.get("return"));
  const tripType    = safeParam(search.get("tripType"), "return");
  const adults      = Number(search.get("adults")   || 1);
  const children    = Number(search.get("children") || 0);
  const infants     = Number(search.get("infants")  || 0);

  const init: Record<string, unknown> = {};
  if (origin)      init.origin      = { iata: origin.toUpperCase(),      name: origin.toUpperCase() };
  if (destination) init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  if (departDate)  init.departDate  = departDate;
  if (tripType === "one-way") { init.oneWay = true; }
  else if (returnDate) { init.returnDate = returnDate; }
  init.passengers = {
    adults:   adults   > 0 ? adults   : 1,
    children: children > 0 ? children : 0,
    infants:  infants  > 0 ? infants  : 0,
  };
  return init;
}

function hasRenderedWeedles(container: HTMLElement | null): boolean {
  if (!container) return false;
  const weedles = Array.from(container.querySelectorAll<HTMLElement>(".tpwl-widget-weedle"));
  if (weedles.length === 0) return false;
  return weedles.some((w) =>
    Array.from(w.children).some(
      (c) => !(c instanceof HTMLScriptElement) && c.textContent?.trim() !== "",
    ) || w.querySelector("iframe,a,img,[class*='tpwl'],[data-tpwl-rendered='true']") !== null,
  );
}

function buildFallbackUrl(origin: string, dest: string) {
  return `/flights/results?${new URLSearchParams({ origin, destination: dest })}`;
}

// ── GoTravel Asia Logo ────────────────────────────────────────────────────────
function GtaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="7" fill="#3D0870"/>
      <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
      <path d="M6 27 Q10 9 27 8" stroke="#F5A623" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z" fill="#F5A623"/>
      <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#fff" letterSpacing="-0.5">GO</text>
    </svg>
  );
}

export default function FlightResults() {
  const search       = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeInfo    = useMemo(() => getRouteInfo(search), [search]);
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");
  const fallbackOrigin = useMemo(
    () => safeParam(search.get("origin"), "BKK").toUpperCase() || "BKK",
    [search],
  );

  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();
    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    document.getElementById("tpwl-search")?.replaceChildren();
    document.getElementById("tpwl-tickets")?.replaceChildren();
    document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    setWidgetState("loading");

    window.TPWL_CONFIGURATION = {
      ...window.TPWL_CONFIGURATION,
      resultsURL: `${window.location.origin}/flights/results`,
      marker: TP_MARKER,
      init: buildInitFromQuery(search),
    };

    window.TPWL_EXTRA = {
      ...(window.TPWL_EXTRA || {}),
      currency: "USD",
      trs: "",
      marker: TP_MARKER,
      domain: window.location.hostname,
      locale: "en",
      link_color: "0770e3",
    };

    const mainScript   = document.createElement("script");
    mainScript.id      = SCRIPT_ID;
    mainScript.async   = true;
    mainScript.type    = "module";
    mainScript.src     = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    const mountWeedles = () => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (!container) return;
      container.querySelectorAll<HTMLElement>('div[data-destination]').forEach((el) => {
        el.innerHTML = "";
        const destination = el.dataset.destination;
        if (!destination || !window.TPWL_EXTRA) return;
        const s = document.createElement("script");
        s.async     = true;
        s.className = WEEDLE_SCRIPT_CLASS;
        const e = window.TPWL_EXTRA;
        s.src =
          `https://tpwidg.com/content` +
          `?currency=${String(e.currency ?? "USD").toLowerCase()}` +
          `&trs=${encodeURIComponent(String(e.trs ?? ""))}` +
          `&shmarker=${encodeURIComponent(String(e.marker ?? TP_MARKER))}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&target_host=${encodeURIComponent(String(e.domain ?? window.location.hostname))}` +
          `&locale=${encodeURIComponent(String(e.locale ?? "en"))}` +
          `&limit=6&powered_by=false` +
          `&primary=%230770e3` +
          `&promo_id=4044&campaign_id=100`;
        el.appendChild(s);
      });
    };

    const mountTimer = window.setTimeout(mountWeedles, 1200);
    const pollStart  = Date.now();
    const pollTimer  = window.setInterval(() => {
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
        title={`Cheap Flights${routeInfo} | GoTravelAsia`}
        description="Compare hundreds of airlines and travel sites to find the cheapest flights."
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --cf-blue:        #0770e3;
          --cf-blue-dark:   #0557b0;
          --cf-blue-light:  #e8f1fd;
          --cf-navy:        #00162b;
          --cf-gray-100:    #f5f7fa;
          --cf-gray-200:    #e6e9ef;
          --cf-gray-400:    #9ba8ba;
          --cf-gray-600:    #4a566d;
          --cf-green:       #00a550;
          --cf-white:       #ffffff;

          --gta-gold:       #F5A623;
          --gta-purple:     #5B0FA8;
          --gta-purple-dark:#3D0870;

          --tpwl-font-family:              "Plus Jakarta Sans", system-ui, sans-serif;
          --tpwl-main-text:                #00162b;
          --tpwl-search-result-background: #f5f7fa;
          --tpwl-search-form-background:   #0770e3;
          --tpwl-headline-text:            #ffffff;
          --tpwl-links:                    #0770e3;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--tpwl-font-family), sans-serif;
          color: var(--cf-navy);
          background: var(--cf-gray-100);
          -webkit-font-smoothing: antialiased;
        }

        body a {
          color: var(--cf-blue);
          text-decoration: none;
          transition: color 0.12s;
        }
        body a:hover { color: var(--cf-blue-dark); text-decoration: underline; }

        /* ── Hide Travelpayouts branding ──────────────────── */
        a[href*="travelpayouts"]:not(.cf-nav__logo),
        [class*="powered-by"], [class*="poweredBy"],
        [class*="powered_by"], [class*="PoweredBy"],
        .tpwl-powered, span[class*="powered"], div[class*="powered"] {
          display: none !important;
        }

        /* ═══ 1. NAVBAR ════════════════════════════════════ */
        .cf-nav {
          background: var(--cf-white);
          border-bottom: 1px solid var(--cf-gray-200);
          position: sticky; top: 0; z-index: 300;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 24px; height: 52px;
        }
        .cf-nav__left  { display: flex; align-items: center; gap: 16px; }
        .cf-nav__right { display: flex; align-items: center; gap: 12px; }

        .cf-nav__back {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 600;
          color: var(--cf-gray-600); text-decoration: none;
          padding: 6px 10px; border-radius: 6px;
          transition: background 0.12s;
        }
        .cf-nav__back:hover {
          background: var(--cf-gray-100);
          color: var(--cf-navy); text-decoration: none;
        }

        .cf-nav__logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none;
        }
        .cf-nav__wordmark {
          font-weight: 800; font-size: 15px;
          color: var(--gta-purple-dark); letter-spacing: -0.02em;
        }
        .cf-nav__wordmark b { color: var(--gta-purple); }

        .cf-nav__divider {
          width: 1px; height: 20px;
          background: var(--cf-gray-200);
        }

        .cf-nav__route {
          font-size: 13px; font-weight: 700;
          color: var(--cf-navy); letter-spacing: 0.01em;
        }

        .cf-nav__pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; text-decoration: none;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.02em;
        }
        .cf-nav__pill--outline {
          border: 1.5px solid var(--cf-gray-200);
          color: var(--cf-gray-600);
          background: transparent;
        }
        .cf-nav__pill--outline:hover {
          border-color: var(--cf-blue);
          color: var(--cf-blue);
          text-decoration: none;
        }
        .cf-nav__pill--primary {
          background: var(--cf-blue);
          color: white; border: none;
        }
        .cf-nav__pill--primary:hover {
          background: var(--cf-blue-dark);
          text-decoration: none; color: white;
        }

        /* ═══ 2. SEARCH BAR ════════════════════════════════ */
        .tpwl-logo-header { display: none !important; }

        .tpwl-search-header {
          background: var(--cf-blue) !important;
          padding: 14px 24px 16px !important;
          position: sticky !important;
          top: 52px !important;
          z-index: 200 !important;
          border-bottom: none !important;
          box-shadow: 0 2px 8px rgba(7,112,227,.25) !important;
        }

        .tpwl__content {
          flex: 1 0 auto;
          max-width: 1280px;
          min-width: 976px;
        }

        .tpwl-search__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ═══ 3. RESULTS ═══════════════════════════════════ */
        .tpwl-main {
          background: var(--cf-gray-100) !important;
          min-height: 60vh;
        }

        .cf-results-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 24px 48px;
        }

        .cf-results-meta {
          font-size: 13px; font-weight: 600;
          color: var(--cf-gray-600);
          margin-bottom: 10px;
        }

        .tpwl-tickets__wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0;
        }

        .tpwl-tickets__wrapper #tpwl-tickets:not(:empty) {
          margin-bottom: 32px;
        }

        /* ── Override TP ticket cards → CF style ──────── */
        [class*="ticket"], [class*="Ticket"],
        [class*="result"], [class*="Result"] {
          border-radius: 10px !important;
          border: 1.5px solid var(--cf-gray-200) !important;
          background: var(--cf-white) !important;
          box-shadow: 0 1px 4px rgba(0,22,43,.06) !important;
          margin-bottom: 8px !important;
          transition: box-shadow 0.15s, border-color 0.15s !important;
        }
        [class*="ticket"]:hover, [class*="Ticket"]:hover,
        [class*="result"]:hover, [class*="Result"]:hover {
          box-shadow: 0 4px 16px rgba(7,112,227,.12) !important;
          border-color: var(--cf-blue) !important;
        }

        [class*="buy"], [class*="Buy"],
        [class*="book"], [class*="Book"],
        button[class*="cta"], a[class*="cta"],
        [class*="BuyButton"], [class*="booking"] {
          background: var(--cf-blue) !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          border: none !important;
          padding: 10px 20px !important;
          transition: background 0.12s !important;
        }
        [class*="buy"]:hover, [class*="Buy"]:hover,
        [class*="book"]:hover, [class*="Book"]:hover {
          background: var(--cf-blue-dark) !important;
        }

        [class*="price"], [class*="Price"] {
          color: var(--cf-navy) !important;
          font-weight: 800 !important;
        }

        [class*="direct"], [class*="Direct"],
        [class*="nonstop"], [class*="nonStop"] {
          color: var(--cf-green) !important;
          font-weight: 700 !important;
        }

        /* ═══ 4. EXPLORE DESTINATIONS ══════════════════════ */
        .cf-explore {
          background: var(--cf-white);
          border-top: 1px solid var(--cf-gray-200);
          padding: 40px 24px;
        }

        .cf-explore__inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .cf-explore__header {
          display: flex; align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .cf-explore__title {
          font-size: 20px; font-weight: 800;
          color: var(--cf-navy); letter-spacing: -0.02em;
        }

        .cf-explore__see-all {
          font-size: 13px; font-weight: 600; color: var(--cf-blue);
        }
        .cf-explore__see-all:hover { text-decoration: underline; }

        .tpwl-widgets__wrapper { display: none !important; }

        .cf-dest-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .cf-dest-card {
          border-radius: 10px;
          border: 1.5px solid var(--cf-gray-200);
          background: var(--cf-white);
          padding: 16px;
          display: flex; flex-direction: column;
          justify-content: space-between;
          min-height: 120px;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
          text-decoration: none; color: inherit;
        }
        .cf-dest-card:hover {
          box-shadow: 0 6px 20px rgba(7,112,227,.12);
          border-color: var(--cf-blue);
          transform: translateY(-2px);
          text-decoration: none; color: inherit;
        }

        .cf-dest-card__iata {
          font-size: 11px; font-weight: 800;
          color: var(--cf-blue);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .cf-dest-card__city {
          font-size: 15px; font-weight: 700;
          color: var(--cf-navy); margin-top: 4px;
        }
        .cf-dest-card__country {
          font-size: 12px; color: var(--cf-gray-400); margin-top: 2px;
        }
        .cf-dest-card__cta {
          font-size: 12px; font-weight: 700;
          color: var(--cf-blue); margin-top: 12px;
        }

        #tpwl-widget-weedles {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .tpwl-widget-weedle {
          display: flex; justify-content: center;
          min-height: 120px;
        }

        .cf-skel {
          border-radius: 10px;
          border: 1.5px solid var(--cf-gray-200);
          background: var(--cf-white);
          min-height: 120px;
          animation: cf-pulse 1.5s ease-in-out infinite;
        }
        @keyframes cf-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .tpwl-widget-container[hidden] { display: none; }

        /* ═══ 5. FOOTER ════════════════════════════════════ */
        .cf-footer {
          background: var(--cf-navy);
          color: rgba(255,255,255,.45);
          padding: 40px 24px;
          text-align: center;
          font-size: 13px;
        }

        .cf-footer__inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .cf-footer__copyright {
          margin-bottom: 12px;
        }

        .cf-footer__links {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .cf-footer__links a {
          color: rgba(255,255,255,.4);
        }
        .cf-footer__links a:hover {
          color: var(--gta-gold);
          text-decoration: none;
        }

        /* ═══ RESPONSIVE ═══════════════════════════════════ */
        @media (max-width: 1024px) {
          .cf-dest-grid,
          #tpwl-widget-weedles { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .cf-nav { padding: 0 16px; }
          .cf-nav__route { display: none; }
          .cf-nav__divider { display: none; }
          .tpwl-search-header { padding: 12px 16px 14px !important; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-search__wrapper { display: block; }
          .cf-results-wrapper { padding: 12px 16px 32px; }
          .cf-dest-grid,
          #tpwl-widget-weedles { grid-template-columns: repeat(2, 1fr); }
          .cf-explore { padding: 28px 16px; }
        }

        @media (max-width: 480px) {
          .cf-nav__back span { display: none; }
          .cf-dest-grid,
          #tpwl-widget-weedles { grid-template-columns: 1fr 1fr; }
          .cf-footer { padding: 32px 16px; }
          .cf-footer__links { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div className="tpwl-page">

        {/* ══ 1. NAVBAR ════════════════════════════════════ */}
        <nav className="cf-nav" role="navigation" aria-label="Main navigation">
          <div className="cf-nav__left">
            <a href="/" className="cf-nav__back" aria-label="Back to GoTravel Asia">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back</span>
            </a>

            <a href="/" className="cf-nav__logo">
              <GtaLogo size={30} />
              <span className="cf-nav__wordmark">GO<b>TRAVEL</b> ASIA</span>
            </a>

            {routeInfo && (
              <>
                <div className="cf-nav__divider" />
                <span className="cf-nav__route">{routeInfo}</span>
              </>
            )}
          </div>

          <div className="cf-nav__right">
            <a href="#" className="cf-nav__pill cf-nav__pill--outline" target="_blank" rel="noopener noreferrer">
              🔔 Price Alerts
            </a>
            <a href="/" className="cf-nav__pill cf-nav__pill--primary">
              New Search
            </a>
          </div>
        </nav>

        {/* ══ 2. SEARCH BAR (Travelpayouts widget) ════════ */}
        <header className="tpwl-search-header">
          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-search" />
            </div>
          </div>
        </header>

        {/* ══ 3. RESULTS (full-width, no sidebar) ═════════ */}
        <main className="tpwl-main">
          <div className="cf-results-wrapper">
            <div className="cf-results-meta">
              <span>Showing available flights</span>
            </div>

            <div className="tpwl-tickets__wrapper">
              <div className="tpwl__content">
                <div id="tpwl-tickets" />
              </div>
            </div>
          </div>

          {/* ══ 4. EXPLORE DESTINATIONS ════════════════════ */}
          <section className="cf-explore" aria-labelledby="cf-explore-title">
            <div className="cf-explore__inner">
              <div className="cf-explore__header">
                <h2 id="cf-explore-title" className="cf-explore__title">
                  Explore popular destinations
                </h2>
                <a href="/flights" className="cf-explore__see-all">See all →</a>
              </div>

              {widgetState === "loading" && (
                <div className="cf-dest-grid" aria-busy="true">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <div key={d.code} className="cf-skel" />
                  ))}
                </div>
              )}

              {widgetState === "fallback" && (
                <div className="cf-dest-grid">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <a
                      key={d.code}
                      href={buildFallbackUrl(fallbackOrigin, d.code)}
                      className="cf-dest-card"
                    >
                      <div>
                        <div className="cf-dest-card__iata">{d.code}</div>
                        <div className="cf-dest-card__city">{d.city}</div>
                        <div className="cf-dest-card__country">{d.country}</div>
                      </div>
                      <div className="cf-dest-card__cta">Search flights →</div>
                    </a>
                  ))}
                </div>
              )}

              <div
                id="tpwl-widget-weedles"
                className="tpwl-widget-container"
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

        {/* ══ 5. FOOTER ════════════════════════════════════ */}
        <footer className="cf-footer">
          <div className="cf-footer__inner">
            <div className="cf-footer__copyright">
              © {new Date().getFullYear()} GoTravel Asia — Powered by Travelpayouts
            </div>
            <div className="cf-footer__links">
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
