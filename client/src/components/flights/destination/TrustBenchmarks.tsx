// client/src/components/flights/destination/TrustBenchmarks.tsx
import { ShieldCheck, Zap, Globe } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Globe,
    title: "1,000+ Flight Providers",
    description:
      "We scan airlines, LCCs, and OTAs so you see the widest range of fares before deciding.",
    tone: "fuchsia",
  },
  {
    icon: Zap,
    title: "Real-time Pricing",
    description:
      "Prices are pulled directly from carriers and updated continuously — no stale cached fares.",
    tone: "amber",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Transparent",
    description:
      "We never hold your card details. Bookings complete directly with the airline or OTA.",
    tone: "emerald",
  },
];

const TONE_STYLES: Record<string, { icon: string; badge: string; border: string }> = {
  fuchsia: {
    icon:  "text-fuchsia-300 bg-fuchsia-400/10",
    badge: "bg-fuchsia-400/10 border-fuchsia-400/20 text-fuchsia-300",
    border:"border-fuchsia-400/10",
  },
  amber: {
    icon:  "text-amber-300 bg-amber-400/10",
    badge: "bg-amber-400/10 border-amber-400/20 text-amber-300",
    border:"border-amber-400/10",
  },
  emerald: {
    icon:  "text-emerald-300 bg-emerald-400/10",
    badge: "bg-emerald-400/10 border-emerald-400/20 text-emerald-300",
    border:"border-emerald-400/10",
  },
};

export default function TrustBenchmarks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
          Why GoTravel
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">
          Book with confidence
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          const s = TONE_STYLES[item.tone];
          return (
            <div
              key={item.title}
              className={`rounded-2xl border ${s.border} bg-white/[0.03] p-5 transition hover:bg-white/[0.05]`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.icon} mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
              <span className={`mt-4 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                100% Free to use
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
