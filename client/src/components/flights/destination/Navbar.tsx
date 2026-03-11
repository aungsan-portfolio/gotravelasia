import { useMemo } from "react";
import { AmberBtn } from "./ui";
import { Plane } from "lucide-react";
import { Link, useLocation } from "wouter";

export interface NavbarProps {
    dest?: string;
    destCode?: string;
    origin?: string;
}

/** Section IDs that exist on the destination page */
const NAV_SECTIONS: { label: string; id: string; active?: boolean }[] = [
    { label: "Find Flights", id: "hero-search", active: true },
    { label: "Deals", id: "flight-deals" },
    { label: "Airlines", id: "airlines-weather" },
    { label: "FAQs", id: "faq-section" },
];

function smoothScrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Compute a sensible future date range for the route summary */
function useDateRange(): string {
    return useMemo(() => {
        const now = new Date();
        const dep = new Date(now);
        dep.setDate(now.getDate() + 30);
        const ret = new Date(dep);
        ret.setDate(dep.getDate() + 7);

        const fmt = (d: Date) => {
            const day = d.getDate();
            const month = d.toLocaleString("en", { month: "short" });
            return `${day} ${month}`;
        };
        return `${fmt(dep)} — ${fmt(ret)}`;
    }, []);
}

export default function Navbar({ dest = "Singapore", destCode = "SIN", origin = "Bangkok" }: NavbarProps) {
    const [, navigate] = useLocation();
    const dateRange = useDateRange();

    const handleSearch = () => {
        navigate(`/flights/results?from=BKK&to=${destCode}`);
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#0b0719]/90 backdrop-blur-md border-b border-white/10 px-6 font-sans">
            <div className="max-w-[1100px] mx-auto flex items-center h-14">
                {/* Logo → home */}
                <Link href="/" className="flex items-center gap-2 mr-5 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white">
                        <Plane size={14} fill="currentColor" />
                    </div>
                    <span className="text-[15px] font-black tracking-tight">
                        <span className="text-slate-100">GoTravel</span>
                        <span className="text-fuchsia-400"> Asia</span>
                    </span>
                </Link>

                {/* Nav links — scroll to page sections */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_SECTIONS.map((s) => (
                        <button
                            key={s.label}
                            onClick={() => smoothScrollTo(s.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${s.active
                                ? "bg-violet-600/20 text-violet-300"
                                : "bg-transparent text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Inline route summary + Search CTA */}
                <div className="ml-auto hidden lg:flex gap-2 items-center">
                    <div className="flex gap-1.5 items-center bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs">
                        <span className="text-slate-100 font-semibold">{origin}</span>
                        <span className="text-slate-500">⇄</span>
                        <span className="text-violet-300 font-semibold">{dest}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{dateRange}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">1 adult · Economy</span>
                    </div>
                    <AmberBtn className="px-5 py-2 text-[13px]" onClick={handleSearch}>Search</AmberBtn>
                </div>
            </div>
        </nav>
    );
}
