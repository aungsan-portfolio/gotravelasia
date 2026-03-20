// client/src/lib/agoda/links.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { buildAgodaSearchUrl, SEA_CITIES } from './links';

const BANGKOK = SEA_CITIES[0];
const BASE = {
  city: BANGKOK,
  checkIn: '2026-04-16',
  checkOut: '2026-04-19',
  adults: 2,
  children: []
};

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('VITE_AGODA_CID', '1844104');
});

describe('buildAgodaSearchUrl', () => {
  test('constructs correct base URL with basic params', () => {
    const url = buildAgodaSearchUrl(BASE);
    expect(url).toContain('city=3940');
    expect(url).toContain('checkin=2026-04-16');
    expect(url).toContain('checkout=2026-04-19');
    expect(url).toContain('los=3');
    expect(url).toContain('adults=2');
    expect(url).toContain('cid=1844104');
    expect(url).toContain('utm_source=gotravel-asia');
  });

  test('includes childages when children provided', () => {
    const url = buildAgodaSearchUrl({
      ...BASE,
      children: [5, 8]
    });
    expect(url).toContain('children=2');
    expect(url).toContain('childages=5%2C8'); // URL-encoded comma
  });

  test('omits childages when no children', () => {
    const url = buildAgodaSearchUrl({ ...BASE, children: [] });
    expect(url).not.toContain('childages');
    expect(url).not.toContain('children=');
  });

  test('throws when los is < 1 (same day)', () => {
    expect(() => buildAgodaSearchUrl({
      ...BASE,
      checkIn: '2026-04-16',
      checkOut: '2026-04-16'
    })).toThrow('Minimum stay');
  });

  test('throws when checkout is before checkin', () => {
    expect(() => buildAgodaSearchUrl({
      ...BASE,
      checkIn: '2026-04-19',
      checkOut: '2026-04-16'
    })).toThrow('Check-out must be after check-in');
  });

  test('defaults rooms to 1 when not specified', () => {
    const url = buildAgodaSearchUrl({ ...BASE, rooms: undefined });
    expect(url).toContain('rooms=1');
  });
  
  test('sets custom utm_campaign based on city slug', () => {
    const url = buildAgodaSearchUrl(BASE);
    expect(url).toContain('utm_campaign=hotels-bangkok');
  });

  test('throws when VITE_AGODA_CID is missing', () => {
    vi.stubEnv('VITE_AGODA_CID', '');
    expect(() => buildAgodaSearchUrl(BASE)).toThrow('VITE_AGODA_CID');
  });
});
