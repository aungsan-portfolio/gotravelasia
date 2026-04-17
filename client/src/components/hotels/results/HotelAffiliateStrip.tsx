import { memo } from "react";
import { ExternalLink } from "lucide-react";

import type { HotelOutboundLinks } from "@shared/hotels/types";

interface HotelAffiliateStripProps {
  affiliateLinks?: HotelOutboundLinks | null;
  cityName: string;
}

function buildLinks(affiliateLinks?: HotelOutboundLinks | null) {
  if (!affiliateLinks) return [];

  return [
    affiliateLinks.agoda ? { id: "agoda", label: "Agoda", href: affiliateLinks.agoda } : null,
    affiliateLinks.booking ? { id: "booking", label: "Booking", href: affiliateLinks.booking } : null,
    affiliateLinks.trip ? { id: "trip", label: "Trip.com", href: affiliateLinks.trip } : null,
    affiliateLinks.expedia ? { id: "expedia", label: "Expedia", href: affiliateLinks.expedia } : null,
    affiliateLinks.klook ? { id: "klook", label: "Klook", href: affiliateLinks.klook } : null,
  ].filter(Boolean) as Array<{ id: string; label: string; href: string }>;
}

function HotelAffiliateStripComponent({
  affiliateLinks,
  cityName,
}: HotelAffiliateStripProps) {
  const links = buildLinks(affiliateLinks);

  if (!links.length) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Explore more hotel booking options
          </p>
          <p className="mt-1 text-sm text-slate-500">
            If the current results feel limited, open trusted partner searches for{" "}
            <span className="font-medium text-slate-700">{cityName}</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export const HotelAffiliateStrip = memo(HotelAffiliateStripComponent);
