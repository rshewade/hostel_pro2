import { test, expect } from '@playwright/test';

test.describe('Role Enforcement (D10 — BUG-002 Prevention)', () => {
  test('unauthenticated user cannot access /student', async ({ page }) => {
    await page.goto('/student');
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('unauthenticated user cannot access /superintendent', async ({ page }) => {
    await page.goto('/superintendent');
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('unauthenticated user cannot access /trustee', async ({ page }) => {
    await page.goto('/trustee');
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('public pages accessible without auth', async ({ page }) => {
    const publicPages = ['/', '/apply', '/track', '/login'];
    for (const url of publicPages) {
      const res = await page.goto(url);
      expect(res?.status()).toBeLessThan(400);
    }
  });
});
