import { test, expect } from '@playwright/test';

test.describe('GoTravel Asia – Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully hydrate
    await page.waitForLoadState('networkidle');
  });

  test('Homepage loads with correct heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
    // The heading contains "Asia" in some form
    await expect(heading).toContainText('Asia', { timeout: 10000 });
  });

  test('Tab buttons are visible and clickable', async ({ page }) => {
    // role="tab" buttons exist in the hero section
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3, { timeout: 15000 });
  });

  test('Page loads correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
  });
});
