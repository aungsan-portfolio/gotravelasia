"use client";

import type React from "react";
import { Mail, ArrowRight, Zap, Target, BadgeDollarSign, AlertCircle } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

const BENEFITS = [
    { icon: Zap, label: "Real-time alerts before prices spike" },
    { icon: Target, label: "SEA routes tailored to your searches" },
    { icon: BadgeDollarSign, label: "Members save avg. $54 per booking" },
];

const AVATARS = ["KH", "MW", "AS", "NT", "PL"];

export interface MainFormProps {
    currentDeal: {
        origin: string;
        destination: string;
        price: number;
    };
    signupCount: number;
    googleReady: boolean;
    googleError?: string;
    googleClientId?: string;
    handleEmailSubmit: (e?: React.FormEvent) => void;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setEmailErr: React.Dispatch<React.SetStateAction<string>>;
    emailErr: string;
}

export default function MainForm({
    currentDeal,
    signupCount,
    googleReady,
    googleError,
    googleClientId,
    handleEmailSubmit,
    email,
    setEmail,
    setEmailErr,
    emailErr,
}: MainFormProps) {
    return (
        <>
            <h2
                className="gt-head text-[28px] font-extrabold text-white leading-tight mb-4"
                style={{ letterSpacing: "-0.025em" }}
            >
                Never Miss a
                <br />
                <span
                    className="text-amber-400"
                    style={{ textShadow: "0 0 26px rgba(251,191,36,.35)" }}
                >
                    Cheap Flight
                </span>{" "}
                Again.
            </h2>

            <div
                key={`${currentDeal.origin}-${currentDeal.destination}-${currentDeal.price}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.08)",
                    animation: "gt-ticker .32s ease",
                }}
            >
                <div
                    className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"
                    style={{ animation: "gt-pulse 1.6s infinite" }}
                />
                <span className="text-xs text-white/60 leading-none">
                    <span className="font-semibold text-white/88">
                        {currentDeal.origin} → {currentDeal.destination}
                    </span>{" "}
                    from <span className="text-emerald-400 font-bold">${currentDeal.price}</span>
                    <span className="text-amber-400"> · saved $47</span>
                    <span className="text-white/28"> · 2h ago</span>
                </span>
            </div>

            <div className="flex flex-col gap-2.5 mb-5 mt-2">
                {BENEFITS.map(({ icon: Icon, label }, i) => (
                    <div
                        key={label}
                        className="flex items-center gap-3"
                        style={{ animation: `gt-fade .4s ease ${i * 0.07}s both` }}
                    >
                        <div
                            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(255,255,255,.06)" }}
                        >
                            <Icon size={15} className="text-amber-400" strokeWidth={2} />
                        </div>
                        <span className="text-[13px] text-white/70 leading-snug">{label}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2.5 mb-5 mt-4">
                <div className="flex">
                    {AVATARS.map((init, i) => (
                        <div
                            key={`${init}-${i}`}
                            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold text-amber-300"
                            style={{
                                marginLeft: i === 0 ? 0 : -8,
                                background: "rgba(251,191,36,.14)",
                                border: "2px solid #0c051e",
                            }}
                        >
                            {init}
                        </div>
                    ))}
                </div>
                <span className="text-[12px] text-white/42">
                    <span className="font-semibold text-amber-400">{signupCount}+</span> joined recently
                </span>
            </div>

            <div className="h-px mb-5" style={{ background: "rgba(255,255,255,.07)" }} />

            {googleClientId ? (
                <GoogleSignInButton
                    googleReady={googleReady}
                    googleClientId={googleClientId}
                />
            ) : null}

            {googleError ? (
                <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-200 text-[12px] px-3 py-2 mb-3 mt-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{googleError}</span>
                </div>
            ) : null}

            <div className="flex items-center gap-3 mb-3 mt-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                <span className="text-white/28 text-xs">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
            </div>

            <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-2 mt-1">
                <div className="relative flex-1">
                    <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
                        strokeWidth={2}
                    />
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailErr("");
                        }}
                        required
                        autoComplete="email"
                        className="w-full pl-9 pr-3 py-3 rounded-xl text-[13px] text-white outline-none placeholder:text-white/22 transition-colors"
                        style={{
                            background: "rgba(255,255,255,.07)",
                            border: "1px solid rgba(255,255,255,.10)",
                            fontFamily: "'DM Sans',sans-serif",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95"
                    style={{
                        background: "linear-gradient(135deg,#fbbf24,#f97316)",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(251,191,36,.28)",
                    }}
                >
                    <ArrowRight size={17} className="text-[#1a0a3e]" strokeWidth={2.5} />
                </button>
            </form>

            {emailErr ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 text-[12px] px-3 py-2 mt-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{emailErr}</span>
                </div>
            ) : null}

            <p className="text-white/20 text-[11px] text-center leading-relaxed mt-4">
                By continuing you accept our{" "}
                <a href="/terms" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">
                    Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-amber-500/55 hover:text-amber-400 underline-offset-2">
                    Privacy
                </a>
                .
            </p>
        </>
    );
}
