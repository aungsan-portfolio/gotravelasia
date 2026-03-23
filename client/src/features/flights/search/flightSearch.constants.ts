// features/flights/search/flightSearch.constants.ts

import type { FlightSearchState } from "./flightSearch.types.js";

export const DEFAULT_FLIGHT_SEARCH: FlightSearchState = {
  tripType: "roundtrip",
  origin: null,
  destination: null,
  departDate: null,
  returnDate: null,
  travellers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabin: "economy",
  currency: "THB",
  locale: "en",
};

export const MAX_ADULTS   = 9;
export const MAX_CHILDREN = 8;
export const MAX_INFANTS  = 4;

// Southeast Asia popular airports for autocomplete fallback
export const SEA_AIRPORTS = [
  { code: "BKK", city: "Bangkok",      name: "Suvarnabhumi",      country: "Thailand"   },
  { code: "DMK", city: "Bangkok",      name: "Don Mueang",        country: "Thailand"   },
  { code: "CNX", city: "Chiang Mai",   name: "Chiang Mai Intl",   country: "Thailand"   },
  { code: "HKT", city: "Phuket",       name: "Phuket Intl",       country: "Thailand"   },
  { code: "SIN", city: "Singapore",    name: "Changi",            country: "Singapore"  },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA",              country: "Malaysia"   },
  { code: "RGN", city: "Yangon",       name: "Mingaladon",        country: "Myanmar"    },
  { code: "MDL", city: "Mandalay",     name: "Mandalay Intl",     country: "Myanmar"    },
  { code: "HAN", city: "Hanoi",        name: "Noi Bai",           country: "Vietnam"    },
  { code: "SGN", city: "Ho Chi Minh",  name: "Tan Son Nhat",      country: "Vietnam"    },
  { code: "DPS", city: "Bali",         name: "Ngurah Rai",        country: "Indonesia"  },
  { code: "CGK", city: "Jakarta",      name: "Soekarno-Hatta",    country: "Indonesia"  },
  { code: "MNL", city: "Manila",       name: "Ninoy Aquino",      country: "Philippines"},
  { code: "REP", city: "Siem Reap",    name: "Siem Reap Intl",    country: "Cambodia"   },
  { code: "VTE", city: "Vientiane",    name: "Wattay Intl",       country: "Laos"       },
] as const;
