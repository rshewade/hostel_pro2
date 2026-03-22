import { test, expect } from '@playwright/test';

test.describe('Application Submission (Public)', () => {
  test('apply page shows vertical selection', async ({ page }) => {
    await page.goto('/apply');
    await expect(page.locator('[data-testid="vertical-boys-hostel"]')).toBeVisible();
    await expect(page.locator('[data-testid="vertical-girls-ashram"]')).toBeVisible();
    await expect(page.locator('[data-testid="vertical-dharamshala"]')).toBeVisible();
  });

  test('POST /api/applications works without auth (BUG-001 prevention)', async ({ request }) => {
    const res = await request.post('/api/applications', {
      data: {
        applicantName: 'Test Applicant',
        applicantMobile: '+919876543210',
        applicantEmail: 'test-e2e@example.com',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        vertical: 'BOYS',
      },
    });
    // Should succeed without auth (public endpoint)
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data).toHaveProperty('id');
    expect(body.data.currentStatus).toBe('SUBMITTED');
  });
});
