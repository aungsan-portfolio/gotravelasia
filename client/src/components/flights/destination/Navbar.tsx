import { AmberBtn } from "./ui";
import { Plane } from "lucide-react";

export interface NavbarProps {
    dest?: string;
    origin?: string;
}

export default function Navbar({ dest = "Singapore", origin = "Bangkok" }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 bg-[#0b0719]/90 backdrop-blur-md border-b border-white/10 px-6 font-sans">
            <div className="max-w-[1100px] mx-auto flex items-center h-14">
                {/* Logo */}
                <div className="flex items-center gap-2 mr-5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white">
                        <Plane size={14} fill="currentColor" />
                    </div>
                    <span className="text-[15px] font-black tracking-tight">
                        <span className="text-slate-100">GoTravel</span>
                        <span className="text-fuchsia-400"> Asia</span>
                    </span>
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {[
                        ["Find Flights", true],
                        ["Deals", false],
                        ["Airlines", false],
                        ["Travel Guide", false],
                    ].map(([n, a]) => (
                        <button
                            key={n as string}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${a
                                    ? "bg-violet-600/20 text-violet-300"
                                    : "bg-transparent text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {n as string}
                        </button>
                    ))}
                </div>

                {/* Inline route summary */}
                <div className="ml-auto hidden lg:flex gap-2 items-center">
                    <div className="flex gap-1.5 items-center bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs">
                        <span className="text-slate-100 font-semibold">{origin}</span>
                        <span className="text-slate-500">⇄</span>
                        <span className="text-violet-300 font-semibold">{dest}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">7 Apr — 14 Apr</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">1 adult · Economy</span>
                    </div>
                    <AmberBtn className="px-5 py-2 text-[13px]">Search</AmberBtn>
                </div>
            </div>
        </nav>
    );
}
