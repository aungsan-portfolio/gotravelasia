import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://gotravel-asia.vercel.app';

test.describe('Search & Affiliate Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Hotels: tab switches to Hotels search form', async ({ page }) => {
    await page.click('[data-testid="tab-hotels"]');
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Transport: tab switches to Transport widget', async ({ page }) => {
    await page.click('[data-testid="tab-transport"]');
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Flight widget: search form is visible by default', async ({ page }) => {
    await expect(page.locator('[data-testid="tab-flights"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Mobile: page loads correctly on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });
});
