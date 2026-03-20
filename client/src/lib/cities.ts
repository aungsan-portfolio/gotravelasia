// client/src/lib/cities.ts

/**
 * Type-safe IATA codes for Southeast Asia and major world hubs.
 * adding 'as const' allows us to derive a union type.
 */
export const IATA_CODES = [
  // Thailand
  'BKK', 'DMK', 'CNX', 'HKT', 'USM', 'KBV', 'UTP',
  // Vietnam
  'SGN', 'HAN', 'DAD', 'CXR', 'PQC',
  // Malaysia
  'KUL', 'PEN', 'BKI', 'LGK',
  // Singapore
  'SIN',
  // Indonesia
  'DPS', 'CGK', 'KNO', 'SUB',
  // Philippines
  'MNL', 'CEB', 'MPH', 'PPS',
  // Myanmar
  'RGN', 'MDL', 'NYU',
  // Cambodia & Laos
  'PNH', 'REP', 'VTE', 'LPQ',
  // Major Hubs
  'SYD', 'MEL', 'ICN', 'SEL', 'GMP', 'TYO', 'HND', 'NRT', 'KIX', 'HKG', 'TPE',
  'LHR', 'CDG', 'DXB', 'IST'
] as const;

export type IataCode = typeof IATA_CODES[number];

/**
 * Single source of truth for City mapping.
 */
export const CITY_MAP: Record<IataCode, string> = {
  // Thailand
  BKK: 'Bangkok',
  DMK: 'Bangkok',
  CNX: 'Chiang Mai',
  HKT: 'Phuket',
  USM: 'Koh Samui',
  KBV: 'Krabi',
  UTP: 'Pattaya',
  // Vietnam
  SGN: 'Ho Chi Minh City',
  HAN: 'Hanoi',
  DAD: 'Da Nang',
  CXR: 'Nha Trang',
  PQC: 'Phu Quoc',
  // Malaysia
  KUL: 'Kuala Lumpur',
  PEN: 'Penang',
  BKI: 'Kota Kinabalu',
  LGK: 'Langkawi',
  // Singapore
  SIN: 'Singapore',
  // Indonesia
  DPS: 'Bali',
  CGK: 'Jakarta',
  KNO: 'Medan',
  SUB: 'Surabaya',
  // Philippines
  MNL: 'Manila',
  CEB: 'Cebu',
  MPH: 'Boracay',
  PPS: 'Puerto Princesa',
  // Myanmar
  RGN: 'Yangon',
  MDL: 'Mandalay',
  NYU: 'Bagan',
  // Cambodia & Laos
  PNH: 'Phnom Penh',
  REP: 'Siem Reap',
  VTE: 'Vientiane',
  LPQ: 'Luang Prabang',
  // Hubs
  SYD: 'Sydney',
  MEL: 'Melbourne',
  ICN: 'Seoul',
  SEL: 'Seoul',
  GMP: 'Seoul',
  TYO: 'Tokyo',
  HND: 'Tokyo',
  NRT: 'Tokyo',
  KIX: 'Osaka',
  HKG: 'Hong Kong',
  TPE: 'Taipei',
  LHR: 'London',
  CDG: 'Paris',
  DXB: 'Dubai',
  IST: 'Istanbul',
};

/**
 * Returns the human-readable city name for a given IATA code.
 * Falls back to the code itself if not found.
 */
export function getCityName(code: string): string {
  const upperCode = code.toUpperCase().trim() as IataCode;
  return CITY_MAP[upperCode] ?? code;
}

/**
 * Returns the IATA code for a given city name.
 * Performs case-insensitive search.
 */
export function getCityCode(name: string): IataCode | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().trim();
  return (Object.entries(CITY_MAP) as [IataCode, string][])
    .find(([, v]) => v.toLowerCase() === normalized)?.[0];
}
