import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Search & Affiliate Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Hotels: Agoda search triggers correct parameterized URL', async ({ page, context }: { page: any, context: any }) => {
    await page.click('button:has-text("Hotels")'); // Switch to Hotels tab
    
    // Select a city (e.g., Bangkok)
    await page.selectOption('select', '3940'); // Bangkok Agoda ID
    
    // Click Search
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button:has-text("Search Hotels on Agoda")')
    ]);

    await newPage.waitForLoadState();
    const url = new URL(newPage.url());
    
    expect(url.hostname).toContain('agoda.com');
    expect(url.searchParams.get('city')).toBe('3940');
    expect(url.searchParams.get('cid')).toBeTruthy();
    expect(url.searchParams.get('utm_source')).toBe('gotravel-asia');
  });

  test('Hotels: children ages dropdown appears when children > 0', async ({ page }: { page: any }) => {
    await page.click('button:has-text("Hotels")');
    
    // Select 2 children
    await page.selectOption('select >> nth=2', '2'); // Children count select
    
    // Verify 2 child age dropdowns appear
    const ageSelects = page.locator('select:has-text("yr old")');
    await expect(ageSelects).toHaveCount(2);
  });

  test('Cars: EconomyBookings deep-link contains affiliate marker', async ({ page, context }: { page: any, context: any }) => {
    // Navigate to a destination results page (e.g., BKK)
    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK&depart=2026-05-01&return=2026-05-10`);
    
    // Click a car category (e.g., Small)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a:has-text("Small car")') 
    ]);

    const url = new URL(newPage.url());
    expect(url.hostname).toContain('economybookings.com');
    expect(url.searchParams.get('utm_source')).toBe('gotravel-asia');
    expect(url.searchParams.get('marker')).toBe('697202');
  });

  test('Tracking: Navigator.sendBeacon fires on affiliate click', async ({ page }: { page: any }) => {
    const beaconFired = new Promise<boolean>((resolve) => {
      page.on('request', (request: any) => {
        if (request.url().includes('/api/track')) {
          resolve(true);
        }
      });
    });

    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK`);
    await page.click('a:has-text("Find stays")');

    expect(await beaconFired).toBe(true);
  });

  test('Mobile UX: MobileSummaryPill shows on scroll', async ({ page }: { page: any }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK`);
    
    const pill = page.locator('.MobileSummaryPill'); 
    await expect(pill).not.toBeVisible();
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(pill).toBeVisible();
  });
});
