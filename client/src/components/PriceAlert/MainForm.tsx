import { Mail } from "lucide-react";
import { formatTHB } from "@/const";

const BENEFITS = [
    { icon: () => <span className="text-[15px]">⚡</span>, label: "Real-time alerts before prices spike" },
    { icon: () => <span className="text-[15px]">🎯</span>, label: "SEA routes tailored to your searches" },
    { icon: () => <span className="text-[15px]">💰</span>, label: "Members save avg. $54 per booking" },
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
            <h2 className="text-[27px] sm:text-[32px] font-extrabold text-white leading-[1.15] mb-3.5 tracking-[-0.025em]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Never Miss a<br />
                <span className="text-amber-400 drop-shadow-[0_0_26px_rgba(251,191,36,0.35)]">Cheap Flight</span> Again.
            </h2>

            {/* Ticker */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-3.5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="text-xs text-white/60 truncate">
                    <span className="font-semibold text-white/90">{currentDeal.origin} → {currentDeal.destination}</span>{" "}
                    from <span className="text-emerald-400 font-bold">${currentDeal.price}</span>
                    <span className="text-amber-400"> · saved $47</span>
                    <span className="text-white/30"> · 2h ago</span>
                </div>
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-2 mb-3.5">
                {BENEFITS.map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-[15px]">
                            <b.icon />
                        </div>
                        <span className="text-[13px] text-white/70">{b.label}</span>
                    </div>
                ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-2.5 mb-3.5">
                <div className="flex -space-x-2">
                    {AVATARS.map((a, i) => (
                        <div key={i} className="w-[26px] h-[26px] rounded-full bg-amber-400/10 border-2 border-[#0c051e] flex items-center justify-center text-[9px] font-bold text-amber-400">
                            {a}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-white/40">
                    <span className="font-bold text-amber-400">+{signupCount}</span> joined today
                </p>
            </div>

            <div className="h-px bg-white/10 mb-3.5" />

            {/* Form */}
            <div>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full h-[46px] bg-white text-[#1a0a3e] rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 shadow-[0_4px_18px_rgba(0,0,0,0.28)] hover:-translate-y-[1px] transition-transform mb-2.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 13.875 17.64 11.567 17.64 9.2z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[12px] text-white/30">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-1">
                    <div className="relative flex-1">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                            placeholder="your@email.com"
                            className={`w-full py-[11px] pl-9 pr-3 rounded-xl bg-white/5 border text-[13px] text-white outline-none focus:border-amber-400/40 transition-colors ${emailErr ? "border-red-500" : "border-white/10"}`}
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-[46px] rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(251,191,36,0.28)] hover:brightness-110 hover:scale-[1.03] transition-all"
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a0a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
                {emailErr && <p className="text-[10px] text-red-400 px-1 font-bold">{emailErr}</p>}
            </div>

            <p className="text-[11px] text-center text-white/20 mt-2.5 leading-[1.6]">
                By continuing you accept our <a href="/terms" className="text-amber-400/55 decoration-transparent hover:underline">Terms</a> and <a href="/privacy" className="text-amber-400/55 decoration-transparent hover:underline">Privacy Policy</a>. Cancel anytime.
            </p>
        </>
    );
}
