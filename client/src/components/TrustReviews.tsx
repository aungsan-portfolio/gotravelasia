import { Plane, Clock, Shield, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Plane,
    emoji: "✈️",
    title: "Compare 500+ flight routes instantly",
    desc: "Search across Aviasales & Trip.com in one place. Flights from Yangon and Mandalay to Bangkok, Singapore, Chiang Mai, and more.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Clock,
    emoji: "💰",
    title: "Real-time prices updated every 6 hours",
    desc: "Our price data refreshes automatically so you always see current fares — no stale prices or bait-and-switch surprises.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    emoji: "🔒",
    title: "Book directly with partners — zero markup",
    desc: "We redirect you straight to Aviasales, Agoda, 12Go, or Klook. You pay the same price as booking direct. No hidden fees, ever.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const PARTNER_STATS = [
  { name: "Aviasales", role: "Flight Search", logo: "/images/partners/aviasales.svg" },
  { name: "Trip.com", role: "Flights & Hotels", logo: "/images/partners/tripcom.svg" },
  { name: "Agoda", role: "Hotel Booking", logo: "/images/partners/agoda.svg" },
  { name: "12Go", role: "Transport", logo: "/images/partners/12go.svg" },
  { name: "Klook", role: "Tours & Activities", logo: "/images/partners/klook.svg" },
];

export default function TrustReviews() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <CheckCircle className="w-4 h-4" />
            Built for travelers from Myanmar
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            What Travelers Love
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real features that help you find better deals across Southeast Asia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl mb-2">{feature.emoji}</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            We compare prices from these trusted partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {PARTNER_STATS.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center gap-2 group">
                <div className="h-10 w-28 flex items-center justify-center grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partner.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
