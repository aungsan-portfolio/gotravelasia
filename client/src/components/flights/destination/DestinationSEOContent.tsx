import type { DestinationPageVM } from "@/types/destination";

interface DestinationSEOContentProps {
  data: DestinationPageVM;
}

export default function DestinationSEOContent({ data }: DestinationSEOContentProps) {
  const { route, hero } = data;
  
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            About flights to {route.destination.city}
          </h2>
          
          <div className="space-y-6 text-slate-400 leading-relaxed">
            <p>
              Finding cheap flights to {route.destination.city} has never been easier. 
              {hero.subtitle && <span> {hero.subtitle}</span>}
              GoTravel Asia aggregates the latest fare data from multiple airlines and booking platforms to bring you the best deals in real-time.
            </p>
            
            <p>
              Whether you are planning a business trip or a leisure holiday in {route.destination.country}, 
              our price insights help you decide the best time to book. 
              Currently, the starting fare for {route.routeLabel} is {data.deals.summary.cheapestPriceLabel}.
            </p>
            
            {route.highlights && (
              <div>
                <h3 className="text-white font-semibold mb-3">Must-visit attractions in {route.destination.city}:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {route.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-fuchsia-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-sm pt-4 border-t border-white/5">
              * Prices are based on one-way fares across the next 12 months. Fares and availability are subject to change. 
              Last updated: {data.status.lastUpdatedLabel}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
