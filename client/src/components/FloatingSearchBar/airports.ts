// ── Shared airports list & search helper ──────────────────────────

export const AIRPORTS = [
  { code: "RGN", city: "Yangon",           name: "Yangon Intl",       country: "Myanmar",      region: "SEA", popularCity: true,  popularCountry: false },
  { code: "MDL", city: "Mandalay",         name: "Mandalay Intl",     country: "Myanmar",      region: "SEA", popularCity: true,  popularCountry: false },
  { code: "NYU", city: "Bagan",            name: "Nyaung U Airport",  country: "Myanmar",      region: "SEA", popularCity: false, popularCountry: false },
  { code: "BKK", city: "Bangkok",          name: "Suvarnabhumi",      country: "Thailand",     region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "CNX", city: "Chiang Mai",       name: "Chiang Mai Intl",   country: "Thailand",     region: "SEA", popularCity: true,  popularCountry: false },
  { code: "HKT", city: "Phuket",           name: "Phuket Intl",       country: "Thailand",     region: "SEA", popularCity: true,  popularCountry: false },
  { code: "SIN", city: "Singapore",        name: "Changi Airport",    country: "Singapore",    region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "KUL", city: "Kuala Lumpur",     name: "KLIA",              country: "Malaysia",     region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "PEN", city: "Penang",           name: "Penang Intl",       country: "Malaysia",     region: "SEA", popularCity: false, popularCountry: false },
  { code: "SGN", city: "Ho Chi Minh City", name: "Tan Son Nhat",      country: "Vietnam",      region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "HAN", city: "Hanoi",            name: "Noi Bai Intl",      country: "Vietnam",      region: "SEA", popularCity: false, popularCountry: false },
  { code: "DAD", city: "Da Nang",          name: "Da Nang Intl",      country: "Vietnam",      region: "SEA", popularCity: true,  popularCountry: false },
  { code: "REP", city: "Siem Reap",        name: "Siem Reap Intl",    country: "Cambodia",     region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "PNH", city: "Phnom Penh",       name: "Phnom Penh Intl",   country: "Cambodia",     region: "SEA", popularCity: false, popularCountry: false },
  { code: "HKG", city: "Hong Kong",        name: "Hong Kong Intl",    country: "Hong Kong",    region: "EA",  popularCity: true,  popularCountry: true  },
  { code: "TYO", city: "Tokyo",            name: "Narita Intl",       country: "Japan",        region: "EA",  popularCity: true,  popularCountry: true  },
  { code: "OSA", city: "Osaka",            name: "Kansai Intl",       country: "Japan",        region: "EA",  popularCity: true,  popularCountry: false },
  { code: "ICN", city: "Seoul",            name: "Incheon Intl",      country: "South Korea",  region: "EA",  popularCity: true,  popularCountry: true  },
  { code: "DPS", city: "Bali",             name: "Ngurah Rai Intl",   country: "Indonesia",    region: "SEA", popularCity: true,  popularCountry: true  },
  { code: "TPE", city: "Taipei",           name: "Taoyuan Intl",      country: "Taiwan",       region: "EA",  popularCity: true,  popularCountry: true  },
  { code: "DXB", city: "Dubai",            name: "Dubai Intl",        country: "UAE",          region: "ME",  popularCity: true,  popularCountry: true  },
  { code: "KMG", city: "Kunming",          name: "Kunming Changshui", country: "China",        region: "EA",  popularCity: false, popularCountry: false },
  { code: "CAN", city: "Guangzhou",        name: "Guangzhou Baiyun",  country: "China",        region: "EA",  popularCity: false, popularCountry: false },
] as const;

export type Airport = (typeof AIRPORTS)[number];

// ── Search ────────────────────────────────────────────────────────
export function searchAirports(q: string): Airport[] {
  if (!q.trim()) return [...AIRPORTS];
  const lq = q.toLowerCase();
  return AIRPORTS.filter(a =>
    a.code.toLowerCase().includes(lq) ||
    a.city.toLowerCase().includes(lq) ||
    a.name.toLowerCase().includes(lq) ||
    a.country.toLowerCase().includes(lq)
  );
}

// ── Popular Countries (deduplicated) ─────────────────────────────
export function getPopularCountries() {
  const seen = new Set<string>();
  return AIRPORTS.filter(a => {
    if (!a.popularCountry || seen.has(a.country)) return false;
    seen.add(a.country);
    return true;
  }).map(a => ({
    country: a.country,
    code:    a.code,
    label:   `Flights to ${a.country}`,
    // SEO URL — static landing page
    href:    `/flights/to/${a.country.toLowerCase().replace(/\s+/g, "-")}`,
  }));
}

// ── Popular Cities (deduplicated) ─────────────────────────────────
export function getPopularCities() {
  const seen = new Set<string>();
  return AIRPORTS.filter(a => {
    if (!a.popularCity || seen.has(a.city)) return false;
    seen.add(a.city);
    return true;
  }).map(a => ({
    city:    a.city,
    code:    a.code,
    country: a.country,
    label:   `Flights to ${a.city}`,
    // SEO URL — static landing page
    href:    `/flights/to/${a.city.toLowerCase().replace(/\s+/g, "-")}`,
  }));
}
