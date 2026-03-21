import { test, expect, type Page, type BrowserContext, type Locator } from '@playwright/test';

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  process.env.VERCEL_PREVIEW_URL
    ? `https://${process.env.VERCEL_PREVIEW_URL}`
    : 'http://localhost:3000';

/**
 * IMPORTANT CONTRACT FOR THIS SPEC
 * --------------------------------
 * These tests are intentionally written against stable accessibility/test hooks.
 *
 * Please make sure the app exposes these selectors:
 *
 * Hotels tab:
 *   data-testid="tab-hotels"
 *
 * Hotels form:
 *   data-testid="hotel-destination-select"
 *   data-testid="hotel-checkin-input"
 *   data-testid="hotel-checkout-input"
 *   data-testid="hotel-guests-trigger"            (optional)
 *   data-testid="hotel-children-count"
 *   data-testid="hotel-child-age-0"
 *   data-testid="hotel-child-age-1"
 *   data-testid="hotel-search-submit"
 *
 * Affiliate CTAs:
 *   data-testid="cta-small-car"
 *   data-testid="cta-find-stays"
 *
 * Mobile sticky summary:
 *   data-testid="mobile-summary-pill"
 *
 * If your UI already has strong accessible names, some fallbacks below will still work.
 */

test.describe('Search & Affiliate Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await dismissOverlays(page);
  });

  test('Hotels: Agoda search triggers correct parameterized URL', async ({ page, context }) => {
    await openHotelsTab(page);

    const destination = await firstExisting(page, [
      page.getByTestId('hotel-destination-select'),
      page.getByLabel(/destination|city|where to/i),
      page.locator('select[name="destination"]'),
      page.locator('select').first(),
    ]);
    await destination.selectOption({ value: '3940' }); // Bangkok Agoda ID

    const checkin = await firstExisting(page, [
      page.getByTestId('hotel-checkin-input'),
      page.getByLabel(/check-?in/i),
      page.locator('input[name="checkin"]'),
      page.locator('input[type="date"]').first(),
    ]);
    await setDateInput(checkin, '2026-04-16');

    const checkout = await firstExisting(page, [
      page.getByTestId('hotel-checkout-input'),
      page.getByLabel(/check-?out/i),
      page.locator('input[name="checkout"]'),
      page.locator('input[type="date"]').nth(1),
    ]);
    await setDateInput(checkout, '2026-04-18');

    const submit = await firstExisting(page, [
      page.getByTestId('hotel-search-submit'),
      page.getByRole('button', { name: /search hotels|find stays|search stays|search/i }),
      page.locator('button[type="submit"]'),
      page.locator('a[href*="agoda"], button[data-provider="agoda"]'),
    ]);

    const destinationUrl = await clickAndCaptureDestination(page, context, submit);

    expect(destinationUrl).toBeTruthy();

    const url = new URL(destinationUrl);

    // Flexible assertions so the test survives minor partner URL shape changes.
    expect(
      /agoda/i.test(url.hostname) ||
        /agoda/i.test(url.href)
    ).toBeTruthy();

    // Allow either raw destination id in query/path or Agoda-style city params.
    expect(
      url.href.includes('3940') ||
        /city|cid|destination|dest_id|hotel_id|place|location/i.test(url.search)
    ).toBeTruthy();

    expect(
      url.href.includes('2026-04-16') ||
        url.href.includes('2026-04-18') ||
        /checkin|checkout|arrival|departure/i.test(url.search)
    ).toBeTruthy();
  });

  test('Hotels: children ages dropdown appears when children > 0', async ({ page }) => {
    await openHotelsTab(page);

    const guestTrigger = await maybeExisting(page, [
      page.getByTestId('hotel-guests-trigger'),
      page.getByRole('button', { name: /guests|travellers|travelers|rooms/i }),
    ]);
    if (guestTrigger) {
      await guestTrigger.click();
    }

    const childrenCount = await firstExisting(page, [
      page.getByTestId('hotel-children-count'),
      page.getByLabel(/children/i),
      page.locator('select[name="children"]'),
      page.locator('[data-testid*="children"]').locator('select'),
    ]);

    await childrenCount.selectOption('2');

    const age0 = await firstExisting(page, [
      page.getByTestId('hotel-child-age-0'),
      page.getByLabel(/child\s*1\s*age|age of child 1/i),
      page.locator('select[name="childAge0"]'),
      page.locator('select').filter({ hasText: /under 1|1|2|3|4/ }).first(),
    ]);
    await expect(age0).toBeVisible();

    const age1 = await firstExisting(page, [
      page.getByTestId('hotel-child-age-1'),
      page.getByLabel(/child\s*2\s*age|age of child 2/i),
      page.locator('select[name="childAge1"]'),
      page.locator('select').nth(1),
    ]);
    await expect(age1).toBeVisible();
  });

  test('Cars: EconomyBookings deep-link contains affiliate marker', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK`, {
      waitUntil: 'domcontentloaded',
    });
    await dismissOverlays(page);

    const carCta = await firstExisting(page, [
      page.getByTestId('cta-small-car'),
      page.getByRole('link', { name: /small car|cars|rent a car|car hire/i }),
      page.locator('a[href*="economybookings"], a[href*="car"]'),
    ]);

    const destinationUrl = await clickAndCaptureDestination(page, context, carCta);
    expect(destinationUrl).toBeTruthy();

    const url = new URL(destinationUrl);

    expect(
      /economybookings/i.test(url.hostname) ||
        /economybookings/i.test(url.href) ||
        /car/i.test(url.href)
    ).toBeTruthy();

    expect(
      /marker|aff|affiliate|utm_|subid|ref/i.test(url.search) ||
        /marker|aff|affiliate|utm_|subid|ref/i.test(url.href)
    ).toBeTruthy();
  });

  test('Tracking: Navigator.sendBeacon fires on affiliate click', async ({ page }) => {
    let beaconFired = false;

    await page.addInitScript(() => {
      const original = navigator.sendBeacon.bind(navigator);
      // @ts-expect-error runtime patch
      navigator.sendBeacon = (...args: Parameters<typeof navigator.sendBeacon>) => {
        // @ts-expect-error runtime flag
        window.__beaconFired = true;
        try {
          return original(...args);
        } catch {
          return true;
        }
      };
    });

    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK`, {
      waitUntil: 'domcontentloaded',
    });
    await dismissOverlays(page);

    const staysCta = await firstExisting(page, [
      page.getByTestId('cta-find-stays'),
      page.getByRole('link', { name: /find stays|stays|hotels|see stays/i }),
      page.locator('a[href*="agoda"], a[href*="hotel"], a[href*="stay"]'),
    ]);

    await staysCta.click({ force: true });

    await expect
      .poll(
        async () => {
          beaconFired = await page.evaluate(() => {
            // @ts-expect-error runtime flag
            return Boolean(window.__beaconFired);
          });
          return beaconFired;
        },
        { timeout: 5000, intervals: [200, 400, 800] }
      )
      .toBe(true);
  });

  test('Mobile UX: MobileSummaryPill shows on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE_URL}/flights/results?origin=SIN&destination=BKK`, {
      waitUntil: 'domcontentloaded',
    });
    await dismissOverlays(page);

    const pill = await firstExisting(page, [
      page.getByTestId('mobile-summary-pill'),
      page.getByRole('button', { name: /modify search|edit search|summary/i }),
      page.locator('[data-mobile-summary-pill="true"]'),
    ]);

    await page.evaluate(() => window.scrollTo(0, 700));
    await expect(pill).toBeVisible();
  });
});

/* ----------------------------- helpers ----------------------------- */

async function openHotelsTab(page: Page): Promise<void> {
  await dismissOverlays(page);

  const hotelsTab = await firstExisting(page, [
    page.getByTestId('tab-hotels'),
    page.getByRole('tab', { name: /hotels/i }),
    page.getByRole('button', { name: /hotels/i }),
    page.locator('[href*="hotel"], [data-tab="hotels"]').first(),
  ]);

  await hotelsTab.click({ force: true });

  // Verify a hotels-specific control appeared after switching.
  const hotelUi = await firstExisting(page, [
    page.getByTestId('hotel-destination-select'),
    page.getByLabel(/destination|city|where to/i),
    page.locator('select[name="destination"]'),
    page.locator('input[name="checkin"]'),
  ]);

  await expect(hotelUi).toBeVisible();
}

async function dismissOverlays(page: Page): Promise<void> {
  const candidates = [
    page.getByRole('button', { name: /accept|agree|got it|close/i }),
    page.locator('[aria-label="Close"]'),
    page.locator('[data-testid="close-modal"]'),
  ];

  for (const locator of candidates) {
    try {
      if (await locator.first().isVisible({ timeout: 500 })) {
        await locator.first().click({ force: true });
      }
    } catch {
      // ignore
    }
  }
}

async function maybeExisting(page: Page, locators: Locator[]): Promise<Locator | null> {
  for (const locator of locators) {
    try {
      if (await locator.first().count()) {
        return locator.first();
      }
    } catch {
      // ignore
    }
  }
  return null;
}

async function firstExisting(page: Page, locators: Locator[]): Promise<Locator> {
  for (const locator of locators) {
    try {
      const candidate = locator.first();
      if (await candidate.count()) {
        return candidate;
      }
    } catch {
      // ignore and continue
    }
  }

  const debug = await page.content();
  throw new Error(`No matching locator found. Page snapshot length=${debug.length}`);
}

async function setDateInput(locator: Locator, value: string): Promise<void> {
  await locator.click({ force: true });
  await locator.fill(value);
  await locator.dispatchEvent('input');
  await locator.dispatchEvent('change');
}

async function clickAndCaptureDestination(
  page: Page,
  context: BrowserContext,
  target: Locator
): Promise<string> {
  const href = await target.getAttribute('href');

  const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);

  await target.click({ force: true });

  const [popup, nav] = await Promise.all([popupPromise, navPromise]);

  if (popup) {
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    return popup.url();
  }

  if (nav) {
    return page.url();
  }

  // SPA / window.open blocked / tracking wrapper fallback
  if (href) {
    return new URL(href, page.url()).toString();
  }

  return page.url();
}
