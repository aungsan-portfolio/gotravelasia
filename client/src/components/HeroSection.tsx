import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Hotel, Bus } from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";

type Porthole = {
  id: number;
  src: string;
  fallback: string;
  size: number;
  top: string;
  left?: string;
  right?: string;
  opacity: number;
  animDur: string;
  animDelay: string;
  animName: string;
};

type HeroSectionProps = {
  activeTab: "flights" | "hotels" | "transport";
  setActiveTab: (tab: "flights" | "hotels" | "transport") => void;
  children: ReactNode;
};

/* ── Animated flight paths ── */
const FLIGHT_PATHS = [
  { id: 0, d: "M -60 280 Q 300 80  900 200", dur: 18, delay: 0 },
  { id: 1, d: "M -60 400 Q 250 180 900 320", dur: 26, delay: -8 },
  { id: 2, d: "M -60 160 Q 400 320 900 100", dur: 22, delay: -14 },
  { id: 3, d: "M -60 520 Q 350 260 900 440", dur: 32, delay: -5 },
];

/* ── BUG FIX #1: cx/cy numeric (viewBox 900×600 based) ── */
const DEST_DOTS = [
  { cx: 612, cy: 228, label: "Bangkok", delay: 0.2 },
  { cx: 702, cy: 330, label: "Bali", delay: 0.9 },
  { cx: 495, cy: 168, label: "Hanoi", delay: 1.4 },
  { cx: 765, cy: 210, label: "Manila", delay: 0.5 },
  { cx: 648, cy: 408, label: "Singapore", delay: 1.1 },
];

/* ── Porthole circles ── */
const PORTHOLES: Porthole[] = [
  {
    id: 0,
    src: "/images/hero/bali.webp",
    fallback: "/images/hero/bali.jpg",
    size: 220,
    top: "-6%",
    left: "-4%",
    opacity: 0.55,
    animDur: "14s",
    animDelay: "0s",
    animName: "portholeFloat0",
  },
  {
    id: 1,
    src: "/images/hero/bangkok.webp",
    fallback: "/images/hero/bangkok.jpg",
    size: 170,
    top: "55%",
    left: "-2%",
    opacity: 0.45,
    animDur: "18s",
    animDelay: "-4s",
    animName: "portholeFloat1",
  },
  {
    id: 2,
    src: "/images/hero/vietnam.webp",
    fallback: "/images/hero/vietnam.jpg",
    size: 260,
    top: "-8%",
    right: "-5%",
    opacity: 0.5,
    animDur: "20s",
    animDelay: "-7s",
    animName: "portholeFloat2",
  },
  {
    id: 3,
    src: "/images/hero/shwedagon.webp",
    fallback: "/images/hero/shwedagon.png",
    size: 150,
    top: "60%",
    right: "-1%",
    opacity: 0.45,
    animDur: "16s",
    animDelay: "-2s",
    animName: "portholeFloat3",
  },
  {
    id: 4,
    src: "/images/hero/singapore.webp",
    fallback: "/images/hero/singapore.png",
    size: 130,
    top: "30%",
    right: "3%",
    opacity: 0.38,
    animDur: "22s",
    animDelay: "-10s",
    animName: "portholeFloat4",
  },
];

const MARQUEE_CITIES = [
  "Bangkok", "Bali", "Tokyo", "Singapore", "Hanoi",
  "Kuala Lumpur", "Phuket", "Ho Chi Minh City",
  "Chiang Mai", "Manila", "Taipei", "Seoul", "Yangon", "Colombo",
];

/* ── HERO STYLES (extracted as constant — no re-inject on render) ── */
const HERO_STYLES = `
  @keyframes flyPath {
    0%   { offset-distance: 0%;   opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  @keyframes destPing {
    0%, 100% { r: 6; opacity: 0.9; }
    50%       { r: 14; opacity: 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes portholeFloat0 {
    0%,100% { transform: translate(0px,0px) rotate(0deg); }
    33%     { transform: translate(8px,-14px) rotate(1.2deg); }
    66%     { transform: translate(-5px,7px) rotate(-0.8deg); }
  }
  @keyframes portholeFloat1 {
    0%,100% { transform: translate(0px,0px) rotate(0deg); }
    40%     { transform: translate(-10px,12px) rotate(-1.5deg); }
    70%     { transform: translate(6px,-8px) rotate(0.9deg); }
  }
  @keyframes portholeFloat2 {
    0%,100% { transform: translate(0px,0px) rotate(0deg); }
    50%     { transform: translate(12px,10px) rotate(2deg); }
  }
  @keyframes portholeFloat3 {
    0%,100% { transform: translate(0px,0px) rotate(0deg); }
    30%     { transform: translate(-8px,-12px) rotate(-1deg); }
    60%     { transform: translate(4px,8px) rotate(1.4deg); }
  }
  @keyframes portholeFloat4 {
    0%,100% { transform: translate(0px,0px) rotate(0deg); }
    45%     { transform: translate(10px,-10px) rotate(1.8deg); }
  }

  /* FEATURE: Reduced motion — all animations off */
  @media (prefers-reduced-motion: reduce) {
    .hero-plane-anim,
    .hero-dest-ring,
    .hero-fade-up,
    .hero-marquee-track,
    .porthole { animation: none !important; }
  }

  .hero-marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 28s linear infinite;
  }
  .hero-marquee-track:hover { animation-play-state: paused; }

  /* BUG FIX #2: offset-path defined here as fallback via JS style below */
  .hero-plane-anim {
    offset-rotate: auto 0deg;
    animation: flyPath var(--dur) linear var(--delay) infinite;
  }

  .hero-dest-ring {
    animation: destPing 2.8s ease-out var(--ping-delay) infinite;
  }
  .hero-fade-up {
    animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) var(--au-delay) both;
  }
  .hero-tab-btn {
    position: relative;
    transition: color 0.2s;
  }
  .hero-tab-btn::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 2px;
    background: #F5C518;
    transform: scaleX(0);
    transition: transform 0.25s cubic-bezier(.22,1,.36,1);
  }
  .hero-tab-btn[data-active="true"]::after { transform: scaleX(1); }

  .porthole {
    position: absolute;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
    will-change: transform;
    contain: layout style paint;
  }
  .porthole::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(167,139,250,0.35);
    box-shadow:
      inset 0 0 24px rgba(91,14,166,0.55),
      inset 0 0 60px rgba(0,0,0,0.40),
      0 0 30px rgba(91,14,166,0.20),
      0 8px 32px rgba(0,0,0,0.45);
    z-index: 2;
  }
  .porthole::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(91,14,166,0.30) 0%,
      rgba(45,5,88,0.55) 60%,
      rgba(11,0,24,0.70) 100%
    );
    z-index: 1;
  }
  .porthole img {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: saturate(0.75) brightness(0.85);
    display: block;
  }
`;

/* ── Inject styles once at module level (not per render) ── */
if (typeof document !== "undefined" && !document.getElementById("hero-styles")) {
  const tag = document.createElement("style");
  tag.id = "hero-styles";
  tag.textContent = HERO_STYLES;
  document.head.appendChild(tag);
}

export default function HeroSection({
  activeTab,
  setActiveTab,
  children,
}: HeroSectionProps) {
  const { t } = useTranslation();
  const { deals } = useFlightData();

  /* BUG FIX #4: realistic deal count */
  const dealCount = useMemo(() => {
    const base = deals.length > 0 ? 12459 + deals.length : 12459;
    return base.toLocaleString();
  }, [deals]);

  /* IMPROVEMENT: tab labels use i18n */
  const tabs = [
    { id: "flights" as const, icon: Plane, labelKey: "tabs.flights" },
    { id: "hotels" as const, icon: Hotel, labelKey: "tabs.hotels" },
    { id: "transport" as const, icon: Bus, labelKey: "tabs.transport" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0b0018 0%, #1a0336 45%, #220444 100%)",
      }}
    >
      {/* ── Layer 1: Grid lines ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.06 }}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[15, 30, 45, 60, 75].map((pct) => (
          <line key={`h-${pct}`} x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`}
            stroke="#a78bfa" strokeWidth="0.8" />
        ))}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
          <line key={`v-${pct}`} x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%"
            stroke="#a78bfa" strokeWidth="0.8" />
        ))}
        <path d="M0 80% Q50% 10% 100% 60%" stroke="#a78bfa" strokeWidth="1" fill="none" />
        <path d="M0 50% Q40% 90% 100% 30%" stroke="#a78bfa" strokeWidth="1" fill="none" />
      </svg>

      {/* ── Layer 2: Flight trails ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.18 }}
        viewBox="0 0 900 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5C518" stopOpacity="0" />
            <stop offset="60%" stopColor="#F5C518" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
          </linearGradient>
        </defs>

        {FLIGHT_PATHS.map((p) => (
          <g key={p.id}>
            <path d={p.d} stroke="#F5C518" strokeWidth="1" fill="none"
              strokeDasharray="6 10" strokeOpacity="0.25" />
            {/* BUG FIX #2: offsetPath set inline */}
            <path
              d={p.d}
              stroke="url(#trailGrad)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="80 9999"
              className="hero-plane-anim"
              style={{
                offsetPath: `path('${p.d}')`,
                "--dur": `${p.dur}s`,
                "--delay": `${p.delay}s`,
              } as React.CSSProperties}
            />
          </g>
        ))}

        {/* BUG FIX #1: numeric cx/cy */}
        {DEST_DOTS.map((d) => (
          <g key={d.label}>
            <circle cx={d.cx} cy={d.cy} r="5" fill="#F5C518" opacity="0.85" />
            <circle
              cx={d.cx} cy={d.cy} r="6"
              fill="none" stroke="#F5C518" strokeWidth="1"
              className="hero-dest-ring"
              style={{ "--ping-delay": `${d.delay}s` } as React.CSSProperties}
            />
            <text x={d.cx} y={d.cy} dy="-14" textAnchor="middle"
              fill="#F5C518" fontSize="10" fontFamily="monospace" opacity="0.7">
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      {/* ── Layer 3: Glow spots ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{
          position: "absolute", top: "-10%", right: "15%",
          width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-5%", left: "5%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Layer 4: Portholes — BUG FIX #3: proper type, no \`as any\` ── */}
      <div className="hidden md:block" aria-hidden="true">
        {PORTHOLES.map((p) => (
          <div
            key={p.id}
            className="porthole"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left ?? "auto",
              right: p.right ?? "auto",
              opacity: p.opacity,
              zIndex: 2,
              animation: `${p.animName} ${p.animDur} ease-in-out ${p.animDelay} infinite`,
            }}
          >
            <picture>
              <source srcSet={p.src} type="image/webp" />
              <img
                src={p.fallback}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width={p.size}
                height={p.size}
              />
            </picture>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="container">

          {/* Live deal badge */}
          <div
            className="text-center mb-6 hero-fade-up"
            style={{ "--au-delay": "0.05s" } as React.CSSProperties}
          >
            {/* FEATURE: Skeleton loader while deals load */}
            {deals.length === 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5"
                style={{
                  border: "1px solid rgba(245,197,24,0.15)",
                  background: "rgba(245,197,24,0.04)",
                  borderRadius: 4,
                }}>
                <div style={{
                  width: 160, height: 12, borderRadius: 4,
                  background: "linear-gradient(90deg, rgba(245,197,24,0.1) 25%, rgba(245,197,24,0.2) 50%, rgba(245,197,24,0.1) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }} />
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium tracking-widest uppercase"
                style={{
                  border: "1px solid rgba(245,197,24,0.35)",
                  color: "rgba(245,197,24,0.85)",
                  letterSpacing: "0.18em",
                  fontFamily: "monospace",
                  background: "rgba(245,197,24,0.06)",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
                </span>
                {dealCount} live deals · Southeast Asia
              </div>
            )}
          </div>

          {/* Heading */}
          <div
            className="text-center mb-10 hero-fade-up"
            style={{ "--au-delay": "0.15s" } as React.CSSProperties}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-3 text-white leading-[1.05]">
              {t("hero.title")}{" "}
              <span style={{ color: "#F5C518" }}>{t("hero.country")}</span>
            </h1>
            <p
              className="text-lg md:text-xl font-normal max-w-lg mx-auto"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Compare AirAsia, VietJet, Scoot, Lion Air & 80+ more • Save up to 70%
            </p>
          </div>

          {/* Search card */}
          <div
            className="max-w-4xl mx-auto hero-fade-up"
            style={{ "--au-delay": "0.28s" } as React.CSSProperties}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(245,197,24,0.20)",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              {/* IMPROVEMENT: accessible tabs with role + aria */}
              <div
                role="tablist"
                aria-label={t("tabs.label", "Search type")}
                className="flex"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tab-panel-${tab.id}`}
                      data-active={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className="hero-tab-btn flex items-center justify-center gap-2 flex-1 px-6 py-3.5 text-sm font-semibold transition-all"
                      style={
                        isActive
                          ? {
                            background: "#F5C518",
                            color: "#2D0558",
                            borderRadius: "40px",
                            margin: "6px 4px",
                            boxShadow: "0 2px 10px rgba(245,197,24,0.35)",
                          }
                          : { color: "rgba(255,255,255,0.65)" }
                      }
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {t(tab.labelKey, tab.labelKey.split(".")[1])}
                    </button>
                  );
                })}
              </div>

              {/* Tab panel */}
              <div
                id={`tab-panel-${activeTab}`}
                role="tabpanel"
                className="p-4 md:p-6"
              >
                {children}
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div
            className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm mt-8 hero-fade-up"
            style={{
              "--au-delay": "0.45s",
              color: "rgba(255,255,255,0.45)",
            } as React.CSSProperties}
          >
            {[
              "No booking fees",
              "Real-time prices",
              "200+ SEA routes",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <span style={{ color: "#F5C518" }} aria-hidden="true">✦</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Marquee ── */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.25)",
          padding: "10px 0",
        }}
      >
        <div className="hero-marquee-track" aria-hidden="true">
          {[0, 1].map((rep) => (
            <span key={rep} className="flex items-center">
              {MARQUEE_CITIES.map((city) => (
                <span
                  key={`${rep}-${city}`}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)",
                    padding: "0 24px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {city}
                  <span style={{ color: "#F5C518", marginLeft: 24, opacity: 0.5 }}>
                    ✦
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
