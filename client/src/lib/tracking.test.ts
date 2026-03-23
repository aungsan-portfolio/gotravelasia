// client/src/lib/tracking.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { trackAffiliateClick } from "./tracking.js";

describe('trackAffiliateClick', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof window === 'undefined') {
      vi.stubGlobal('window', { location: { href: 'http://localhost' } });
    }
  });

  test('sends beacon on affiliate click', () => {
    // Mock navigator.sendBeacon
    const mockBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(global.navigator, 'sendBeacon', {
      value: mockBeacon,
      configurable: true
    });

    trackAffiliateClick('agoda', { city: 'bangkok', los: 3 });

    expect(mockBeacon).toHaveBeenCalledWith(
      '/api/track',
      expect.stringContaining('"provider":"agoda"')
    );
    expect(mockBeacon).toHaveBeenCalledWith(
        '/api/track',
        expect.stringContaining('"city":"bangkok"')
      );
  });

  test('does not throw if window.va is undefined', () => {
    // Ensure window.va is undefined
    const originalVa = window.va;
    // @ts-expect-error
    delete window.va;

    expect(() => trackAffiliateClick('agoda', {})).not.toThrow();

    // Restore
    window.va = originalVa;
  });

  test('calls window.va if defined', () => {
    window.va = vi.fn();
    
    trackAffiliateClick('economybookings', { category: 'small' });

    expect(window.va).toHaveBeenCalledWith('event', expect.objectContaining({
      name: 'click_economybookings',
      provider: 'economybookings',
      category: 'small'
    }));
  });
});
