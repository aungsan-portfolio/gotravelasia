// client/src/lib/agoda/links.ts

export interface AgodaCity {
  id: number;           // Agoda numeric ID for search
  slug: string;
  displayName: string;
  country: 'TH' | 'VN' | 'MY' | 'PH' | 'ID' | 'SG' | 'MM';
}

export interface AgodaSearchParams {
  city: AgodaCity;
  checkIn: string;      // YYYY-MM-DD
  checkOut: string;     // YYYY-MM-DD
  adults: number;
  children: number[];   // each item = child age, e.g. [5, 8]
  rooms?: number;
}

/**
 * Accuracy verified Agoda City IDs
 * Source: Agoda Hotel Data File & Manual Verification
 */
export const SEA_CITIES: AgodaCity[] = [
  { id: 3940, slug: 'bangkok',       displayName: 'Bangkok',       country: 'TH' },
  { id: 3962, slug: 'chiang-mai',    displayName: 'Chiang Mai',    country: 'TH' },
  { id: 1722, slug: 'da-nang',       displayName: 'Da Nang',       country: 'VN' },
  { id: 1716, slug: 'hanoi',         displayName: 'Hanoi',         country: 'VN' },
  { id: 3943, slug: 'penang',        displayName: 'Penang',        country: 'MY' },
  { id: 4354, slug: 'cebu',          displayName: 'Cebu',          country: 'PH' },
  { id: 3945, slug: 'bali',          displayName: 'Bali',          country: 'ID' },
  { id: 6139, slug: 'yangon',        displayName: 'Yangon',        country: 'MM' },
];

/**
 * Builds a robust Agoda search URL with full tracking and validation.
 */
export function buildAgodaSearchUrl(params: AgodaSearchParams): string {
  // 1. CID Validation (Prevent commission loss)
  const cid = import.meta.env.VITE_AGODA_CID;
  if (!cid) {
    throw new Error(
      '[Agoda] VITE_AGODA_CID is not set.\n' +
      'Add it to .env.local:\n' +
      'VITE_AGODA_CID=your_cid_here'
    );
  }

  // 2. Date & LOS Validation
  const ci = new Date(params.checkIn);
  const co = new Date(params.checkOut);
  
  if (params.checkOut < params.checkIn) {
    throw new Error('Check-out must be after check-in');
  }

  const los = Math.ceil((co.getTime() - ci.getTime()) / 86400000);
  
  if (los < 1) {
    throw new Error('Minimum stay is 1 night');
  }
  if (los > 90) {
    throw new Error('Maximum stay is 90 nights');
  }

  // 3. URL construction
  const url = new URL('https://www.agoda.com/search');
  url.searchParams.set('city',      String(params.city.id));
  url.searchParams.set('checkin',   params.checkIn);
  url.searchParams.set('checkout',  params.checkOut);
  url.searchParams.set('los',       String(los));
  url.searchParams.set('adults',    String(params.adults));
  url.searchParams.set('rooms',     String(params.rooms ?? 1));
  url.searchParams.set('cid',       cid);
  
  // 4. UTM Attribution
  url.searchParams.set('utm_source',   'gotravel-asia');
  url.searchParams.set('utm_medium',   'affiliate');
  url.searchParams.set('utm_campaign', `hotels-${params.city.slug}`);
  url.searchParams.set('utm_content',  'search-box');

  // 5. Children & Ages
  if (params.children.length > 0) {
    url.searchParams.set('children',  String(params.children.length));
    url.searchParams.set('childages', params.children.join(','));
  }

  return url.toString();
}
