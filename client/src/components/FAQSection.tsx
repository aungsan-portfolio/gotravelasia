import { useState, useEffect, memo } from "react";

// ===================================================
// FAQSection Component
// Accordion FAQ + JSON-LD structured data for Google rich snippets
// All content audited against GoTravel Asia's actual features
// ===================================================

const FAQS = [
    {
        question: "How do I find the cheapest flights in Southeast Asia?",
        answer:
            "The best strategy is to be flexible with your travel dates. Use our Price Calendar to see which days have the lowest fares. Generally, flying on Tuesdays or Wednesdays is cheaper than weekends. Booking 6–8 weeks in advance for short-haul regional flights gives the best prices. Use our search engine to compare prices across multiple airlines and booking platforms to find the best deal.",
    },
    {
        question: "What airlines fly within Southeast Asia?",
        answer:
            "Southeast Asia has excellent connectivity with both full-service and budget carriers. Full-service airlines include Thai Airways, Singapore Airlines, Malaysia Airlines, and Vietnam Airlines. Budget airlines include AirAsia (extensive network), VietJet, Scoot, Nok Air, Lion Air, and Cebu Pacific. Myanmar's international carriers include MAI (Myanmar Airways International) and MNA (Myanmar National Airlines), serving routes to Bangkok, Singapore, and other regional destinations.",
    },
    {
        question: "Do I need a visa to travel between Southeast Asia countries?",
        answer:
            "Visa requirements vary by nationality and destination. Most ASEAN citizens can travel visa-free within the bloc. Many countries offer visa-on-arrival or e-visa options. Popular visa-free or easy entry destinations include Thailand (30-day visa exemption for many nationalities), Singapore, and Malaysia. Always check requirements specific to your passport before booking.",
    },
    {
        question: "What's the best time to book flights to Bangkok or Singapore?",
        answer:
            "For the lowest prices, book domestic and short-haul flights 3–6 weeks in advance. For international routes (Bangkok to Tokyo, Singapore to Sydney), book 2–3 months ahead. Avoid peak travel periods: Thai New Year (Songkran, April), Christmas/New Year, and Chinese New Year see the highest prices. Set a price alert on our site to get notified when deals are available.",
    },
    {
        question: "How does GoTravel Asia compare prices?",
        answer:
            "GoTravel Asia uses powerful search technology to compare prices across airlines and booking platforms. We display the best available options so you can compare total prices including taxes and fees. Our Price Calendar shows you the cheapest dates to fly at a glance, helping you save money on every trip.",
    },
    {
        question: "What are the baggage allowances on Southeast Asian airlines?",
        answer:
            "Budget airlines (AirAsia, Scoot, VietJet) typically include 7kg carry-on only in base fares — checked baggage costs extra (usually $10–25 per bag). Full-service airlines include 20–30kg checked baggage in economy tickets. We recommend adding baggage at booking time as airport purchases are significantly more expensive.",
    },
    {
        question: "What search options are available on GoTravel Asia?",
        answer:
            "You can search for round-trip or one-way flights across Southeast Asia and beyond. Choose from Economy, Premium Economy, Business, or First Class cabin options. Select the number of adult, child, and infant passengers. Our Price Calendar helps you find the cheapest travel dates, and you can also search for hotels and transport options from our homepage.",
    },
    {
        question: "How do price alerts work?",
        answer:
            "Sign up with your email address to receive exclusive deals and price drop notifications. We'll send you the best flight offers across Southeast Asia directly to your inbox. You can subscribe from the Price Alerts button at the top of any page. This is especially useful if you're planning a trip and want to catch the lowest fares without checking every day.",
    },
];

export default memo(function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Inject JSON-LD structured data for Google rich snippets
    useEffect(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                },
            })),
        };
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        script.id = "faq-jsonld";
        document.getElementById("faq-jsonld")?.remove();
        document.head.appendChild(script);
        return () => {
            document.getElementById("faq-jsonld")?.remove();
        };
    }, []);

    const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

    return (
        <section
            className="w-full max-w-[1200px] mx-auto px-5 sm:px-6 py-10"
            style={{ fontFamily: "'Source Sans 3', -apple-system, sans-serif" }}
        >
            <div className="max-w-[760px] mx-auto">
                {/* Header */}
                <div className="mb-9 text-center">
                    <h2 className="text-[1.8rem] font-[800] text-[#111827] mb-2 tracking-[-0.3px]">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-[0.9rem] text-[#6b7280]">
                        Everything you need to know about booking flights in Southeast Asia
                    </p>
                </div>

                {/* Accordion */}
                <div className="flex flex-col gap-3">
                    {FAQS.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className={`border rounded-[14px] overflow-hidden transition-all duration-200 ${isOpen
                                        ? "border-[#5B0EA6] bg-[#faf5ff]"
                                        : "border-[#e5e7eb] bg-white"
                                    }`}
                            >
                                {/* Question button */}
                                <button
                                    onClick={() => toggle(i)}
                                    aria-expanded={isOpen}
                                    className="w-full py-5 px-6 bg-transparent border-none flex justify-between items-center cursor-pointer text-left gap-4"
                                >
                                    <span
                                        className={`font-semibold text-[0.95rem] leading-[1.4] transition-colors ${isOpen
                                                ? "font-bold text-[#5B0EA6]"
                                                : "text-[#111827]"
                                            }`}
                                    >
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[0.9rem] font-bold transition-all duration-200 ${isOpen
                                                ? "bg-[#5B0EA6] text-white rotate-180"
                                                : "bg-[#f3f4f6] text-[#6b7280]"
                                            }`}
                                    >
                                        ▾
                                    </span>
                                </button>

                                {/* Answer */}
                                {isOpen && (
                                    <div
                                        className="px-6 pb-5 text-[0.9rem] text-[#4b5563] leading-[1.8] border-t border-[#e9d5ff] -mt-0.5 pt-4"
                                        style={{ animation: "faqSlideDown 0.2s ease" }}
                                    >
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-10 bg-gradient-to-br from-[#f5f0ff] to-[#ede5ff] rounded-2xl py-7 px-8 flex justify-between items-center flex-wrap gap-4 border border-[#d4b5ff]">
                    <div>
                        <div className="font-bold text-[1rem] text-[#3b0764]">
                            Still have questions?
                        </div>
                        <div className="text-[0.85rem] text-[#7c3aed] mt-1">
                            Our travel experts are here to help
                        </div>
                    </div>
                    <a
                        href="/contact"
                        className="py-3 px-6 bg-[#5B0EA6] text-white rounded-[10px] no-underline font-bold text-[0.88rem] hover:bg-[#4a0b8a] transition-colors"
                    >
                        Contact Us ›
                    </a>
                </div>
            </div>

            <style>{`
        @keyframes faqSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </section>
    );
});
