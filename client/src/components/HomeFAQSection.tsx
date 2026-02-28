/**
 * HomeFAQSection.tsx — Go Travel Asia
 * ─────────────────────────────────────
 * Compact FAQ section for the Home page bottom.
 * Separate from the full /faq page — different wording, value-prop focus.
 * Design: Cheapflights-style accordion with purple/gold brand tokens.
 */
import { useState, memo } from "react";
import { Link } from "wouter";

const HOME_FAQS = [
    {
        question: "How does GoTravel Asia find cheap flights?",
        answer:
            "GoTravel Asia searches hundreds of airlines and travel agents simultaneously using real-time fare data. We compare prices across Thai AirAsia, Thai Airways, Bangkok Airways, Singapore Airlines, and 200+ more — then show you the cheapest options sorted by price, duration, or stops. We never charge a booking fee; you pay exactly what the airline or agent charges.",
    },
    {
        question: "When is the cheapest time to fly in Southeast Asia?",
        answer:
            "Generally, flying Tuesday to Thursday is cheaper than weekends. For international routes, booking 6–8 weeks in advance gives the best fares. Avoid Songkran (April), Chinese New Year (Jan–Feb), and school holiday periods — prices can triple during these times. Using our ±2 days flexible date tool can save up to 30% on some routes.",
    },
    {
        question: "Is GoTravel Asia free to use?",
        answer:
            "Yes, completely free. GoTravel Asia earns a referral commission from airlines and booking agents when you click through and complete a purchase. This commission comes from the travel provider, never from you. The prices you see are always the actual fares — we don't add any markup or hidden fees.",
    },
    {
        question: "How much can I save with Price Alerts?",
        answer:
            "Our users save up to 30% on average by timing their purchases with Price Alerts. Set an alert for any route and we monitor fares 24/7 — when the price drops, you get an instant notification so you can book at the perfect moment. Alerts are especially powerful for holiday routes where fares can swing $50–$150 within a single week.",
    },
    {
        question: "What airlines does GoTravel Asia compare?",
        answer:
            "We compare 200+ airlines including Thai AirAsia, AirAsia X, Thai Airways, Bangkok Airways, Nok Air, Thai Lion Air, Singapore Airlines, Malaysia Airlines, Vietnam Airlines, Myanmar Airways International, and many more. We also search major booking platforms like Agoda, Trip.com, and Traveloka to ensure you see every available option.",
    },
];

export default memo(function HomeFAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

    return (
        <section
            className="w-full py-12"
            style={{
                background: "#FAF7FF",
                borderTop: "1px solid rgba(91,14,166,0.10)",
                fontFamily: "'Plus Jakarta Sans', 'Source Sans 3', sans-serif",
            }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <h2
                    className="text-xl font-extrabold mb-6"
                    style={{ color: "#0F0521" }}
                >
                    Frequently asked questions
                </h2>

                <div className="flex flex-col gap-2">
                    {HOME_FAQS.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className="rounded-xl border overflow-hidden transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(91,14,166,0.10)]"
                                style={{
                                    background: "#ffffff",
                                    borderColor: "rgba(91,14,166,0.10)",
                                }}
                            >
                                <button
                                    onClick={() => toggle(i)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center justify-between py-[18px] px-5 bg-transparent border-none cursor-pointer text-left gap-3"
                                >
                                    <span
                                        className="text-sm font-bold leading-snug"
                                        style={{ color: "#0F0521" }}
                                    >
                                        {faq.question}
                                    </span>
                                    <span
                                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                                        style={{
                                            background: isOpen ? "#5B0EA6" : "#F0EBF9",
                                            color: isOpen ? "#ffffff" : "#2E1761",
                                            transform: isOpen ? "rotate(45deg)" : "none",
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                        </svg>
                                    </span>
                                </button>

                                {isOpen && (
                                    <div
                                        className="px-5 pb-[18px] text-sm leading-[1.8]"
                                        style={{
                                            color: "#6B5B9A",
                                            animation: "homeFaqSlide 0.2s ease",
                                        }}
                                    >
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Link to full FAQ page */}
                <div className="mt-6 text-center">
                    <Link
                        href="/faq"
                        className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:underline"
                        style={{ color: "#5B0EA6" }}
                    >
                        View all FAQs →
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes homeFaqSlide {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
});
