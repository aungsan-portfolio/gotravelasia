import { AFFILIATE } from "./config.js";
import type { IataCode } from "./cities.js";

export type TransportType = 'train' | 'bus' | 'ferry';

export interface TransportStation {
  id: string;          // 12Go station ID
  name: string;        // Human readable name
  cityCode: IataCode;  // Link to cities.ts
  type: TransportType;
}

/**
 * Option C: Static SEA Stations Registry for MVP
 * These IDs are referenced from 12Go Asia's common route identifiers.
 */
export const SEA_STATIONS: TransportStation[] = [
  // Thailand
  { id: 'bangkok', name: 'Bangkok (All Stations)', cityCode: 'BKK', type: 'train' },
  { id: 'chiang-mai', name: 'Chiang Mai', cityCode: 'CNX', type: 'train' },
  { id: 'phuket-bus-terminal-2', name: 'Phuket Bus Terminal 2', cityCode: 'HKT', type: 'bus' },
  { id: 'koh-samui-all-piers', name: 'Koh Samui (All Piers)', cityCode: 'USM', type: 'ferry' },
  { id: 'krabi-bus-terminal', name: 'Krabi Bus Terminal', cityCode: 'KBV', type: 'bus' },
  { id: 'pattaya-any-station', name: 'Pattaya', cityCode: 'UTP', type: 'bus' },
  
  // Vietnam
  { id: 'da-nang-station', name: 'Da Nang Railway Station', cityCode: 'DAD', type: 'train' },
  { id: 'hanoi-station', name: 'Hanoi Railway Station', cityCode: 'HAN', type: 'train' },
  { id: 'ho-chi-minh-station', name: 'Saigon Railway Station', cityCode: 'SGN', type: 'train' },
  
  // Malaysia
  { id: 'kuala-lumpur-sentral', name: 'Kuala Lumpur Sentral', cityCode: 'KUL', type: 'train' },
  { id: 'penang-sentral', name: 'Penang Sentral (Butterworth)', cityCode: 'PEN', type: 'bus' },
  
  // Cambodia
  { id: 'phnom-penh-station', name: 'Phnom Penh Station', cityCode: 'PNH', type: 'train' },
  { id: 'siem-reap-bus-station', name: 'Siem Reap Bus Station', cityCode: 'REP', type: 'bus' },
];

export function getStationById(id: string): TransportStation | undefined {
  return SEA_STATIONS.find(s => s.id === id);
}

export function getStationsByCity(cityCode: IataCode): TransportStation[] {
  return SEA_STATIONS.filter(s => s.cityCode === cityCode);
}

/**
 * Builds a 12Go Asia affiliate search URL
 * Deep route links only work on main 12go.asia domain (not white label)
 */
export function build12GoUrl(fromId: string, toId: string, date?: string): string {
  const baseUrl = `https://12go.asia/en/travel/${fromId}/${toId}`;
  const params = new URLSearchParams({ z: AFFILIATE.TWELVE_GO_REFERER });
  if (date) params.set('date', date);
  return `${baseUrl}?${params.toString()}`;
}

/** White Label homepage — use for branded "Browse All" links */
export const WHITE_LABEL_HOME = `https://gotravelasia.12go.asia/?z=${AFFILIATE.TWELVE_GO_REFERER}`;
