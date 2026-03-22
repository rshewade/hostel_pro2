import { test, expect } from '@playwright/test';

test.describe('API Health & Smoke', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('cron endpoint returns 401 without secret (BUG-013 prevention)', async ({ request }) => {
    const res = await request.post('/api/admin/cron/data-retention');
    expect(res.status()).toBe(401);
  });

  test('cron endpoint returns 200 with correct secret', async ({ request }) => {
    const res = await request.post('/api/admin/cron/data-retention', {
      headers: { 'x-cron-secret': process.env.CRON_SECRET || 'dev-cron-secret' },
    });
    expect(res.status()).toBe(200);
  });
});
