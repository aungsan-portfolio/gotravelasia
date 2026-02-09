import { describe, it, expect } from 'vitest';
import { searchTransport, getPopularRoutes } from './transport';

describe('Transport Service', () => {
  describe('searchTransport', () => {
    it('should return schedules for Bangkok to Chiang Mai route', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      expect(result.from).toBe('BKK');
      expect(result.to).toBe('CNX');
      expect(result.date).toBe('2026-01-29');
      expect(result.schedules).toHaveLength(3);
      expect(result.affiliateLink).toContain('12go.asia');
    });

    it('should return schedules for Bangkok to Phuket route', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'PHK',
        date: '2026-01-29',
      });

      expect(result.schedules).toHaveLength(2);
      expect(result.schedules[0].company).toBe('Phuket Tour');
      expect(result.schedules[0].price).toBe(450);
    });

    it('should return empty array for unknown route', async () => {
      const result = await searchTransport({
        from: 'PAI',
        to: 'CRI',
        date: '2026-01-29',
      });

      expect(result.schedules).toHaveLength(0);
    });

    it('should include required fields in schedule objects', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      const schedule = result.schedules[0];
      expect(schedule).toHaveProperty('id');
      expect(schedule).toHaveProperty('type');
      expect(schedule).toHaveProperty('company');
      expect(schedule).toHaveProperty('departureTime');
      expect(schedule).toHaveProperty('arrivalTime');
      expect(schedule).toHaveProperty('duration');
      expect(schedule).toHaveProperty('price');
      expect(schedule).toHaveProperty('currency');
      expect(schedule).toHaveProperty('seats');
      expect(schedule).toHaveProperty('rating');
      expect(schedule).toHaveProperty('bookingUrl');
    });

    it('should have valid transport types', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      result.schedules.forEach((schedule) => {
        expect(['bus', 'train', 'minibus']).toContain(schedule.type);
      });
    });

    it('should have valid price and rating values', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      result.schedules.forEach((schedule) => {
        expect(schedule.price).toBeGreaterThan(0);
        expect(schedule.rating).toBeGreaterThanOrEqual(0);
        expect(schedule.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should generate correct affiliate link format', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      expect(result.affiliateLink).toBe(
        'https://www.12go.asia/en/travel/bus/bkk-cnx'
      );
    });
  });

  describe('getPopularRoutes', () => {
    it('should return popular routes for Chiang Mai', () => {
      const routes = getPopularRoutes('CNX');

      expect(routes).toHaveLength(3);
      expect(routes[0].label).toBe('Bangkok to Chiang Mai');
      expect(routes[1].label).toBe('Chiang Mai to Bangkok');
      expect(routes[2].label).toBe('Chiang Mai to Phuket');
    });

    it('should return popular routes for Phuket', () => {
      const routes = getPopularRoutes('PHK');

      expect(routes).toHaveLength(3);
      expect(routes[0].label).toBe('Bangkok to Phuket');
      expect(routes[1].label).toBe('Phuket to Krabi');
      expect(routes[2].label).toBe('Phuket to Bangkok');
    });

    it('should return popular routes for Krabi', () => {
      const routes = getPopularRoutes('KBI');

      expect(routes).toHaveLength(2);
      expect(routes[0].label).toBe('Phuket to Krabi');
      expect(routes[1].label).toBe('Krabi to Phuket');
    });

    it('should return empty array for unknown destination', () => {
      const routes = getPopularRoutes('UNKNOWN');

      expect(routes).toHaveLength(0);
    });

    it('should include from and to codes in route objects', () => {
      const routes = getPopularRoutes('CNX');

      routes.forEach((route) => {
        expect(route).toHaveProperty('from');
        expect(route).toHaveProperty('to');
        expect(route).toHaveProperty('label');
        expect(route.from).toMatch(/^[A-Z]{3}$/);
        expect(route.to).toMatch(/^[A-Z]{3}$/);
      });
    });
  });

  describe('Schedule Data Validation', () => {
    it('should have realistic Bangkok to Chiang Mai schedules', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      const schedule = result.schedules[0];
      expect(schedule.company).toBe('Nok Air');
      expect(schedule.type).toBe('bus');
      expect(schedule.departureTime).toBe('08:00');
      expect(schedule.duration).toBe('1h 15m');
      expect(schedule.price).toBe(1200);
      expect(schedule.currency).toBe('THB');
      expect(schedule.rating).toBe(4.8);
    });

    it('should have realistic Bangkok to Phuket schedules', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'PHK',
        date: '2026-01-29',
      });

      expect(result.schedules).toHaveLength(2);
      expect(result.schedules[0].company).toBe('Phuket Tour');
      expect(result.schedules[0].departureTime).toBe('07:00');
      expect(result.schedules[0].duration).toBe('5h 30m');
    });

    it('should have unique schedule IDs', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      const ids = result.schedules.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid booking URLs', async () => {
      const result = await searchTransport({
        from: 'BKK',
        to: 'CNX',
        date: '2026-01-29',
      });

      result.schedules.forEach((schedule) => {
        expect(schedule.bookingUrl).toContain('12go.asia');
        expect(schedule.bookingUrl).toMatch(/^https?:\/\//);
      });
    });
  });
});
