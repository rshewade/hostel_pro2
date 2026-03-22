import { test, expect } from '@playwright/test';

test.describe('Track Page (D8 — BUG-005 Prevention)', () => {
  test('track page renders form', async ({ page }) => {
    await page.goto('/track');
    await expect(page.locator('[data-testid="tracking-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="track-button"]')).toBeVisible();
  });

  test('invalid tracking number shows not-found, not infinite spinner', async ({ page }) => {
    await page.goto('/track');
    await page.fill('[data-testid="tracking-input"]', 'INVALID-0000');
    await page.fill('[data-testid="mobile-input"]', '+919876543210');
    await page.click('[data-testid="track-button"]');

    // Must resolve within 5 seconds
    await expect(
      page.locator('[data-testid="track-not-found"]')
    ).toBeVisible({ timeout: 5000 });

    // Spinner must NOT still be visible
    await expect(
      page.locator('[data-testid="loading-spinner"]')
    ).not.toBeVisible();
  });
});
