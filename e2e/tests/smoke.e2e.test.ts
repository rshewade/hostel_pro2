import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('unauthenticated /student redirects to /login', async ({ page }) => {
    await page.goto('/student');
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('POST /api/applications works without auth (BUG-001)', async ({ request }) => {
    const res = await request.post('/api/applications', {
      data: { applicantName: 'E2E Test', applicantMobile: '+919876543210', applicantEmail: `e2e-${Date.now()}@test.com`, dateOfBirth: '2000-01-01', gender: 'Male', vertical: 'BOYS' },
    });
    expect(res.status()).toBe(201);
  });

  test('cron endpoint returns 401 without secret (BUG-013)', async ({ request }) => {
    const res = await request.post('/api/admin/cron/data-retention');
    expect(res.status()).toBe(401);
  });

  test('track page renders inputs (BUG-005 state machine)', async ({ page }) => {
    await page.goto('/track');
    await expect(page.locator('[data-testid="tracking-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="track-button"]')).toBeVisible();
  });
});
