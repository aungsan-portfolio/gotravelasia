import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import {
    Layers, Palette, Code2, Search, Calendar, Globe, Zap, Shield,
    ArrowRight, ExternalLink, ChevronRight
} from "lucide-react";

// ─── Section Navigation ───
const SECTIONS = [
    { id: "hero", label: "Intro" },
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "widget", label: "Search Widget" },
    { id: "calendar", label: "Calendar" },
    { id: "code", label: "Code" },
    { id: "demo", label: "Live Demo" },
    { id: "references", label: "References" },
];

// ─── Price tiers for demo calendar ───
const PRICE_TIERS = {
    cheapest: { bg: "#a8f0be", text: "#054d14", label: "Cheapest" },
    average: { bg: "#fcc98a", text: "#5b2601", label: "Average" },
    expensive: { bg: "#fbb0ad", text: "#680d08", label: "Expensive" },
};

const TECH_TAGS = [
    "React 19", "TypeScript", "Tailwind CSS 4", "Vite 7",
    "Express", "tRPC", "Amadeus API", "PostHog",
];

const DESIGN_PRINCIPLES = [
    { icon: Zap, title: "Performance First", desc: "Lazy loading, code splitting, optimized bundles" },
    { icon: Palette, title: "Token-Based Theming", desc: "CSS variables for consistent color system" },
    { icon: Shield, title: "Graceful Degradation", desc: "Multiple data sources with automatic fallback" },
    { icon: Globe, title: "Accessibility", desc: "ARIA labels, keyboard navigation, semantic HTML" },
];

const ARCHITECTURE_LAYERS = [
    { label: "Frontend", items: ["React Components", "Tailwind CSS", "Price Calendar UI"], color: "#dbeafe" },
    { label: "API Layer", items: ["Express Routes", "tRPC", "Rate Limiting"], color: "#fef3c7" },
    { label: "Data Sources", items: ["Amadeus API", "Travelpayouts", "Bot Scraper"], color: "#dcfce7" },
    { label: "Analytics", items: ["PostHog Events", "Search Tracking", "Abandonment"], color: "#fce7f3" },
];

// ─── Demo Calendar Data ───
function generateDemoMonth(year: number, month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const r = Math.random();
        const tier = r < 0.3 ? "cheapest" : r < 0.7 ? "average" : "expensive";
        const price = tier === "cheapest" ? 42 + Math.floor(Math.random() * 20) : tier === "average" ? 65 + Math.floor(Math.random() * 30) : 98 + Math.floor(Math.random() * 40);
        days.push({ day: d, tier, price });
    }
    return days;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Section wrapper ───
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={`scroll-mt-20 py-16 md:py-24 ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>
        </section>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-3">{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{children}</h2>;
}

function SectionDesc({ children }: { children: React.ReactNode }) {
    return <p className="text-lg text-gray-500 max-w-2xl mb-10">{children}</p>;
}

// ─── Main Component ───
export default function HowItWorks() {
    const [activeSection, setActiveSection] = useState("hero");
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Demo calendar data
    const now = new Date();
    const [month1] = useState(() => generateDemoMonth(now.getFullYear(), now.getMonth()));
    const [month2] = useState(() => generateDemoMonth(now.getFullYear(), now.getMonth() + 1));
    const month1Label = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const month2Label = `${MONTHS[(now.getMonth() + 1) % 12]} ${now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()}`;

    // Intersection observer for sidebar highlight
    const observerRef = useRef<IntersectionObserver | null>(null);
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id);
                });
            },
            { rootMargin: "-40% 0px -50% 0px" }
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current?.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <Layout>
            <div className="flex">
                {/* ─── Sidebar Navigation (desktop) ─── */}
                <nav className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-40 pl-4">
                    <div className="flex flex-col gap-1 bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-md border border-gray-100">
                        {SECTIONS.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeSection === s.id
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="flex-1">
                    {/* ═══ 1. HERO ═══ */}
                    <Section id="hero" className="!pt-8 !pb-12">
                        <div className="text-center">
                            {/* Color bars */}
                            <div className="flex justify-center gap-1.5 mb-8">
                                {["#a8f0be", "#fcc98a", "#fbb0ad", "#dbeafe", "#e9d5ff"].map((c) => (
                                    <div key={c} className="w-10 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                                ))}
                            </div>

                            <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-4">Case Study</p>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">
                                Building a Smart<br />
                                <span className="text-orange-500">Flight Search</span> Platform
                            </h1>
                            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-8">
                                How we designed a multi-source flight comparison engine with real-time price calendars for Southeast Asia.
                            </p>

                            {/* Placeholder for hero image */}
                            <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-sky-50 via-white to-orange-50 border border-gray-100 shadow-lg aspect-[16/7] flex items-center justify-center">
                                <span className="text-gray-300 text-sm font-medium">📸 Hero image placeholder</span>
                            </div>
                        </div>
                    </Section>

                    {/* ═══ 2. OVERVIEW ═══ */}
                    <Section id="overview" className="bg-gray-50/50">
                        <SectionLabel>Overview</SectionLabel>
                        <SectionTitle>Technology & Design</SectionTitle>
                        <SectionDesc>A modern stack built for speed, reliability, and beautiful user experiences.</SectionDesc>

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Tech tags */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {TECH_TAGS.map((tag) => (
                                        <span key={tag} className="px-3 py-1.5 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Design principles */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Design Principles</h3>
                                {DESIGN_PRINCIPLES.map((p) => {
                                    const Icon = p.icon;
                                    return (
                                        <div key={p.title} className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-orange-50 text-orange-500 shrink-0">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{p.title}</div>
                                                <div className="text-sm text-gray-500">{p.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Section>

                    {/* ═══ 3. ARCHITECTURE ═══ */}
                    <Section id="architecture">
                        <SectionLabel>Architecture</SectionLabel>
                        <SectionTitle>Layered System Design</SectionTitle>
                        <SectionDesc>Each layer operates independently with clean interfaces between them.</SectionDesc>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {ARCHITECTURE_LAYERS.map((layer) => (
                                <div key={layer.label} className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: layer.color }}>
                                    <div className="font-bold text-gray-900 text-sm mb-3">{layer.label}</div>
                                    <ul className="space-y-1.5">
                                        {layer.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Quote */}
                        <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white">
                            <p className="text-lg md:text-xl font-medium leading-relaxed mb-3">
                                "Multiple data sources with automatic fallback ensure prices are always available — even when individual APIs go down."
                            </p>
                            <p className="text-sm text-gray-400">— Data Pipeline Architecture</p>
                        </div>
                    </Section>

                    {/* ═══ 4. SEARCH WIDGET ═══ */}
                    <Section id="widget" className="bg-gray-50/50">
                        <SectionLabel>Search Widget</SectionLabel>
                        <SectionTitle>Inline Search Experience</SectionTitle>
                        <SectionDesc>A compact, horizontal search bar inspired by the best in the industry.</SectionDesc>

                        {/* Widget mockup */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-8 max-w-4xl">
                            <div className="flex flex-col md:flex-row items-stretch gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                {[
                                    { label: "FROM", value: "Yangon (RGN)", icon: "📍" },
                                    { label: "TO", value: "Singapore (SIN)", icon: "✈️" },
                                    { label: "DEPART", value: "Wed, Mar 12", icon: "📅" },
                                    { label: "RETURN", value: "Add return", icon: "↩️" },
                                    { label: "TRAVELERS", value: "1 Adult, Economy", icon: "👤" },
                                ].map((field) => (
                                    <div key={field.label} className="flex-1 px-3 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{field.label}</div>
                                        <div className="text-sm font-bold text-gray-900 truncate">{field.icon} {field.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CSS class explanation table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-bold text-gray-900">Component</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-900">Pattern</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-900">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        ["Input Fields", "Inline horizontal layout", "Compact, desktop-first search experience"],
                                        ["Trip Type", "Toggle button group", "One-way / Return / Multi-city"],
                                        ["Date Picker", "Popover + PriceCalendar", "Color-coded prices while selecting dates"],
                                        ["Passengers", "Stepper controls in dropdown", "Adults, Children, Infants with cabin class"],
                                        ["CTA Button", "Orange solid button", "High-contrast, accessible call-to-action"],
                                    ].map(([comp, pattern, purpose]) => (
                                        <tr key={comp} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-semibold text-gray-900">{comp}</td>
                                            <td className="py-3 px-4 text-gray-600">{pattern}</td>
                                            <td className="py-3 px-4 text-gray-500">{purpose}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* ═══ 5. CALENDAR COLORS ═══ */}
                    <Section id="calendar">
                        <SectionLabel>Calendar Colors</SectionLabel>
                        <SectionTitle>Token-Based Color System</SectionTitle>
                        <SectionDesc>A three-tier color system that instantly communicates price levels.</SectionDesc>

                        {/* Color token cards */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-10">
                            {Object.values(PRICE_TIERS).map((tier) => (
                                <div key={tier.label} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <div className="h-20" style={{ backgroundColor: tier.bg }} />
                                    <div className="p-4 bg-white">
                                        <div className="font-bold text-gray-900">{tier.label}</div>
                                        <div className="text-xs text-gray-500 mt-1 font-mono">bg: {tier.bg} · text: {tier.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 4-step process */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { step: "1", title: "Fetch Prices", desc: "Amadeus + Travelpayouts + bot data in parallel" },
                                { step: "2", title: "Merge & Rank", desc: "Highest-priority source wins per date" },
                                { step: "3", title: "Classify Tiers", desc: "Cheapest / Average / Expensive based on distribution" },
                                { step: "4", title: "Render Colors", desc: "CSS tokens applied to each calendar cell" },
                            ].map((s) => (
                                <div key={s.step} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{s.title}</div>
                                        <div className="text-sm text-gray-500">{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ═══ 6. CODE ═══ */}
                    <Section id="code" className="bg-gray-50/50">
                        <SectionLabel>Implementation</SectionLabel>
                        <SectionTitle>Code Architecture</SectionTitle>
                        <SectionDesc>Clean TypeScript with token-based styling and graceful fallbacks.</SectionDesc>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* CSS tokens */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Color Token Definition</h3>
                                <pre className="bg-gray-900 text-gray-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                                    {`// Price tier tokens
const TIER_STYLES = {
  cheapest: {
    bg: "#a8f0be",
    text: "#054d14",
  },
  average: {
    bg: "#fcc98a",
    text: "#5b2601",
  },
  expensive: {
    bg: "#fbb0ad",
    text: "#680d08",
  },
};`}
                                </pre>
                            </div>

                            {/* Data pipeline */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Multi-Source Data Pipeline</h3>
                                <pre className="bg-gray-900 text-gray-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                                    {`// Fetch from all sources in parallel
const [amadeus, bot, tp] =
  await Promise.allSettled([
    fetchAmadeus(origin, dest, month),
    readBotData(origin, dest),
    fetchTravelpayouts(origin, dest),
  ]);

// Merge with priority:
// Amadeus > Bot > Travelpayouts
const merged = mergePrices(
  amadeus, bot, tp
);`}
                                </pre>
                            </div>
                        </div>

                        {/* Key insights panel */}
                        <div className="mt-8 bg-gray-900 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4">Key Implementation Insights</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    ["Token-based", "All colors are CSS variables — one change updates everything"],
                                    ["Graceful fallback", "If Amadeus is down, bot data and Travelpayouts fill in"],
                                    ["1hr cache", "Amadeus responses cached to respect API limits"],
                                ].map(([title, desc]) => (
                                    <div key={title} className="text-sm">
                                        <div className="text-orange-400 font-bold mb-1">{title}</div>
                                        <div className="text-gray-400">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* ═══ 7. INTERACTIVE DEMO ═══ */}
                    <Section id="demo">
                        <SectionLabel>Interactive Demo</SectionLabel>
                        <SectionTitle>Live Price Calendar</SectionTitle>
                        <SectionDesc>Click any day to see the color-coded pricing in action.</SectionDesc>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[{ label: month1Label, data: month1 }, { label: month2Label, data: month2 }].map(({ label, data }) => (
                                <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900 text-center">{label}</div>
                                    <div className="p-3">
                                        {/* Weekday headers */}
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {WEEKDAYS.map((d) => (
                                                <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                                            ))}
                                        </div>
                                        {/* Day cells */}
                                        <div className="grid grid-cols-7 gap-1">
                                            {data.map((cell, i) =>
                                                cell === null ? (
                                                    <div key={`empty-${i}`} />
                                                ) : (
                                                    <button
                                                        key={cell.day}
                                                        type="button"
                                                        onClick={() => setSelectedDay(selectedDay === cell.day ? null : cell.day)}
                                                        className={`relative rounded-lg p-1.5 text-center transition-all hover:scale-105 ${selectedDay === cell.day ? "ring-2 ring-gray-900 ring-offset-1" : ""
                                                            }`}
                                                        style={{
                                                            backgroundColor: PRICE_TIERS[cell.tier as keyof typeof PRICE_TIERS].bg,
                                                            color: PRICE_TIERS[cell.tier as keyof typeof PRICE_TIERS].text,
                                                        }}
                                                    >
                                                        <div className="text-xs font-bold">{cell.day}</div>
                                                        <div className="text-[10px] font-semibold">${cell.price}</div>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                            {Object.values(PRICE_TIERS).map((tier) => (
                                <div key={tier.label} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: tier.bg }} />
                                    <span className="text-sm font-semibold text-gray-600">{tier.label}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ═══ 8. REFERENCES ═══ */}
                    <Section id="references" className="bg-gray-50/50">
                        <SectionLabel>References</SectionLabel>
                        <SectionTitle>Resources & Links</SectionTitle>
                        <SectionDesc>Technologies and APIs powering this platform.</SectionDesc>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: "Amadeus API", desc: "Flight Offers Search endpoint for real-time prices", url: "https://developers.amadeus.com" },
                                { title: "Travelpayouts", desc: "Aviasales affiliate with multiple price endpoints", url: "https://www.travelpayouts.com" },
                                { title: "React 19", desc: "Modern UI library with concurrent features", url: "https://react.dev" },
                                { title: "Tailwind CSS", desc: "Utility-first CSS framework for rapid design", url: "https://tailwindcss.com" },
                            ].map((ref) => (
                                <a
                                    key={ref.title}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                                >
                                    <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                                        {ref.title}
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                    <div className="text-sm text-gray-500">{ref.desc}</div>
                                </a>
                            ))}
                        </div>
                    </Section>

                    {/* ─── Footer CTA ─── */}
                    <section className="py-16 text-center">
                        <div className="max-w-2xl mx-auto px-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ready to find cheap flights?</h2>
                            <p className="text-gray-500 mb-6">Try our search engine — compare 80+ airlines across Southeast Asia.</p>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                Search Flights <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
