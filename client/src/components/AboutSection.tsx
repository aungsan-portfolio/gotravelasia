import { useState } from "react";

const features = [
    {
        icon: "⚡",
        title: "Real-time prices",
        desc: "Live deals from 80+ airlines. No outdated fares.",
    },
    {
        icon: "🔍",
        title: "Compare in seconds",
        desc: "AirAsia, VietJet, Scoot, Lion Air — all in one search.",
    },
    {
        icon: "🎯",
        title: "Zero booking fees",
        desc: "What you see is what you pay. Always.",
    },
    {
        icon: "🔔",
        title: "Price drop alerts",
        desc: "We watch prices 24/7. You just wait for the ping.",
    },
    {
        icon: "🗺️",
        title: "200+ SEA routes",
        desc: "Bangkok to Bali. Yangon to Seoul. We've got it.",
    },
    {
        icon: "💸",
        title: "Save up to 70%",
        desc: "Book early or last-minute. Either way, save more.",
    },
];

const faqs = [
    {
        q: "Is GoTravel Asia free to use?",
        a: "100% free. We earn from partners, never from you.",
    },
    {
        q: "How do I get the cheapest flight?",
        a: "Turn on Price Alerts. We'll tell you the exact moment prices drop.",
    },
    {
        q: "Do you charge booking fees?",
        a: "Never. The price you see is the final price.",
    },
    {
        q: "Which airlines do you cover?",
        a: "80+ airlines across Southeast Asia — every major carrier included.",
    },
];

export default function AboutSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="bg-[#f9f7ff] text-[#1a0035] py-16 px-6 mx-auto">
            <div className="max-w-[1100px] mx-auto">
                {/* ── Hero Slogan ── */}
                <div className="text-center mb-14">
                    <div className="inline-block bg-gradient-to-br from-[#5a0099] to-[#7c00d4] text-[#FFD700] text-[11px] font-bold tracking-[2.5px] uppercase py-1.5 px-4 rounded-full mb-5 shadow-sm">
                        ✈ About GoTravel Asia
                    </div>

                    <h2 className="text-[clamp(28px,5vw,42px)] font-extrabold leading-tight mb-4 font-serif text-[#1a0035]">
                        Cheap flights across Asia.{" "}
                        <span className="text-[#7c00d4] block sm:inline">No nonsense.</span>
                    </h2>

                    <p className="text-base sm:text-[17px] text-[#6b5080] max-w-[480px] mx-auto leading-relaxed">
                        We search hundreds of airlines so you don't have to. Just great deals,
                        delivered fast.
                    </p>
                </div>

                {/* ── Feature Pills ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-white border border-[#7c00d4]/10 rounded-2xl p-5 flex items-start gap-3.5 shadow-[0_2px_12px_rgba(90,0,153,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(90,0,153,0.12)] cursor-default"
                        >
                            <span className="text-[26px] leading-none shrink-0">{f.icon}</span>
                            <div>
                                <div className="font-bold text-[14px] mb-1 text-[#1a0035]">
                                    {f.title}
                                </div>
                                <div className="text-[13px] text-[#7b5baa] leading-relaxed">
                                    {f.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Price Alert CTA Banner ── */}
                <div className="bg-gradient-to-br from-[#5a0099] to-[#9b00e8] rounded-[20px] p-8 md:px-10 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-6 mb-14 shadow-[0_8px_32px_rgba(90,0,153,0.25)] text-center sm:text-left">
                    <div>
                        <div className="text-[#FFD700] font-extrabold text-xl mb-1.5 font-serif">
                            🔔 Never miss a deal.
                        </div>
                        <div className="text-white/80 text-[14px]">
                            Set a Price Alert — we'll notify you the moment fares drop.
                        </div>
                    </div>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="bg-[#FFD700] text-[#2a0050] font-bold text-[14px] py-3 px-7 rounded-xl no-underline whitespace-nowrap shadow-[0_4px_16px_rgba(255,215,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        Search flights →
                    </button>
                </div>

                {/* ── FAQ ── */}
                <div className="max-w-[700px] mx-auto">
                    <h3 className="text-lg font-bold mb-4 text-[#3a006b] text-center sm:text-left">
                        Quick answers
                    </h3>

                    <div className="space-y-0 text-left">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="border-b border-[#7c00d4]/10 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full bg-transparent border-none py-4 flex justify-between items-center cursor-pointer text-left font-semibold text-[15px] text-[#1a0035] hover:text-[#7c00d4] transition-colors gap-3 focus:outline-none"
                                >
                                    <span className="flex-1">{faq.q}</span>
                                    <span
                                        className={`text-[#7c00d4] text-xl font-light shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : "rotate-0"
                                            }`}
                                    >
                                        +
                                    </span>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-[150px] opacity-100 mb-4" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <p className="text-[14px] text-[#6b5080] m-0 leading-relaxed pr-8">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bottom tagline ── */}
                <p className="text-center mt-12 text-[13px] text-[#b09ac0] font-medium">
                    Trusted by 50,000+ travelers across Southeast Asia 🌏
                </p>
            </div>
        </div>
    );
}
