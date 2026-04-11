interface FlightIntelligenceStripProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  "Compare fares from partner agencies",
  "Final booking happens on the partner site",
  "Prices may change before payment",
];

export function FlightIntelligenceStrip({ items = DEFAULT_ITEMS }: FlightIntelligenceStripProps) {
  return (
    <section className="border-b border-white/10 bg-gradient-to-b from-[#1D0D31] to-[#140A24]">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 text-[11px] font-medium text-white/72 sm:px-6 lg:px-8">
        {items.map((item, idx) => (
          <div key={item} className="flex items-center gap-2">
            {idx > 0 && <span className="hidden h-1 w-1 rounded-full bg-white/35 sm:inline-block" />}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
