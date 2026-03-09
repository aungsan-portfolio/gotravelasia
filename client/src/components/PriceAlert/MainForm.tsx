import { ArrowRight, Mail, Zap, Target, BadgeDollarSign, Radio } from "lucide-react";
import { formatTHB } from "@/const";

const BENEFITS = [
    { icon: Zap, label: "Real-time alerts before prices spike" },
    { icon: Target, label: "SEA routes tailored to your searches" },
    { icon: BadgeDollarSign, label: "Members save avg. $54 per booking" },
];

const AVATARS = ["KH", "MW", "AS", "NT", "PL"];

interface MainFormProps {
    currentDeal: { origin: string; destination: string; price: number };
    signupCount: number;
    handleGoogleSignIn: () => void;
    handleEmailSubmit: (e?: React.FormEvent) => void;
    email: string;
    setEmail: (email: string) => void;
    setEmailErr: (err: string) => void;
    emailErr: string;
}

export default function MainForm({
    currentDeal,
    signupCount,
    handleGoogleSignIn,
    handleEmailSubmit,
    email,
    setEmail,
    setEmailErr,
    emailErr,
}: MainFormProps) {
    return (
        <>
            {/* Headline */}
            <h2 className="gt-head text-[28px] font-extrabold text-white leading-tight mb-4"
                style={{ letterSpacing: "-0.025em" }}>
                Never Miss a<br />
                <span className="text-amber-400" style={{ textShadow: "0 0 26px rgba(251,191,36,.35)" }}>
                    Cheap Flight
                </span>{" "}Again.
            </h2>

            {/* Live ticker */}
            <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.08)",
                    animation: "gt-ticker .32s ease",
                }}
            >
                <Radio size={12} className="text-red-400 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-xs text-white/60 leading-none">
                    <span className="font-semibold text-white/88">
                        {currentDeal.origin} → {currentDeal.destination}
                    </span>{" "}from{" "}
                    <span className="text-emerald-400 font-bold">${currentDeal.price}</span>
                    <span className="text-amber-400"> · saved $47</span>
                    <span className="text-white/28"> · 2h ago</span>
                </span>
            </div>

            {/* Benefits list */}
            <div className="flex flex-col gap-2.5 mb-4">
                {BENEFITS.map(({ icon: Icon, label }, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3"
                        style={{ animation: `gt-fade .4s ease ${i * 0.07}s both` }}
                    >
                        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(255,255,255,.06)" }}>
                            <Icon size={15} className="text-amber-400" strokeWidth={2} />
                        </div>
                        <span className="text-[13px] text-white/70 leading-snug">{label}</span>
                    </div>
                ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex">
                    {AVATARS.map((init, i) => (
                        <div
                            key={i}
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
                    <span className="font-semibold text-amber-400">+{signupCount}</span> joined today
                </span>
            </div>

            {/* Divider */}
            <div className="h-px mb-4" style={{ background: "rgba(255,255,255,.07)" }} />

            {/* ── AUTH ──────────────────────────────────── */}

            {/* Google */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="gt-google w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-[#1a0a3e] transition-all duration-200 mb-2.5"
                style={{
                    background: "#fff", border: "none", cursor: "pointer",
                    boxShadow: "0 4px 18px rgba(0,0,0,.28)",
                    fontFamily: "'DM Sans',sans-serif",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 13.875 17.64 11.567 17.64 9.2z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
            </button>

            {/* OR */}
            <div className="flex items-center gap-3 mb-2.5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                <span className="text-white/28 text-xs">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
            </div>

            {/* Email */}
            <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-1">
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
                        autoComplete="email"
                        onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                        className="w-full pl-9 pr-3 py-3 rounded-xl text-[13px] text-white outline-none placeholder:text-white/22 transition-colors"
                        style={{
                            background: "rgba(255,255,255,.07)",
                            border: `1px solid ${emailErr ? "rgba(248,113,113,.5)" : "rgba(255,255,255,.10)"}`,
                            fontFamily: "'DM Sans',sans-serif",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    aria-label="Send magic link"
                    className="gt-submit w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150"
                    style={{
                        background: "linear-gradient(135deg,#fbbf24,#f97316)",
                        border: "none", cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(251,191,36,.28)",
                    }}
                >
                    <ArrowRight size={17} className="text-[#1a0a3e]" strokeWidth={2.5} />
                </button>
            </form>

            {emailErr && (
                <p className="text-red-400 text-xs mt-1 px-0.5">{emailErr}</p>
            )}

            {/* Terms */}
            <p className="text-white/20 text-[11px] text-center leading-relaxed mt-3">
                By continuing you accept our{" "}
                <a href="/terms" className="text-amber-500/55 hover:text-amber-400 transition-colors underline-offset-2">Terms</a>
                {" "}and{" "}
                <a href="/privacy" className="text-amber-500/55 hover:text-amber-400 transition-colors underline-offset-2">Privacy Policy</a>.
                {" "}Cancel anytime.
            </p>
        </>
    );
}
