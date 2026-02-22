const PARTNERS = [
  { name: "Aviasales", url: "https://www.aviasales.com", logo: "/images/partners/aviasales.svg" },
  { name: "Trip.com", url: "https://www.trip.com", logo: "/images/partners/tripcom.svg" },
  { name: "Agoda", url: "https://www.agoda.com", logo: "/images/partners/agoda.svg" },
  { name: "12Go", url: "https://12go.asia/?z=14566451&sub_id=partner_strip", logo: "/images/partners/12go.svg" },
  { name: "Klook", url: "https://www.klook.com", logo: "/images/partners/klook.svg" },
];

export default function Partners() {
  return (
    <section className="py-8 bg-card border-b border-border">
      <div className="container">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
          Compare Deals from Top Partners
        </p>

        <div
          className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <div
            className="flex w-max gap-12 items-center will-change-transform [transform:translate3d(0,0,0)] animate-[scroll_20s_linear_infinite] md:animate-[scroll_30s_linear_infinite] group-hover:[animation-play-state:paused]"
          >
            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <a
                key={`${partner.name}-${i}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center justify-center h-8 md:h-12 w-28 md:w-36 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-out rounded-md"
                title={`Search on ${partner.name}`}
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
