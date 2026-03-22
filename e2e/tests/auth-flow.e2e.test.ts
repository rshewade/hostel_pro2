import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../fixtures/auth.fixture';

const ROLE_DASHBOARDS = [
  { ...TEST_ACCOUNTS.student, expectedUrl: '/student' },
  { ...TEST_ACCOUNTS.superintendent, expectedUrl: '/superintendent' },
  { ...TEST_ACCOUNTS.trustee, expectedUrl: '/trustee' },
  { ...TEST_ACCOUNTS.accounts, expectedUrl: '/accounts' },
  { ...TEST_ACCOUNTS.parent, expectedUrl: '/parent' },
];

test.describe('Auth Flow (D9)', () => {
  for (const { email, password, expectedUrl } of ROLE_DASHBOARDS) {
    test(`${email} redirects to ${expectedUrl}`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(`**${expectedUrl}`, { timeout: 10000 });
      expect(page.url()).toContain(expectedUrl);
    });
  }
});

test.describe('Protected Routes', () => {
  test('unauthenticated user redirected to /login', async ({ page }) => {
    await page.goto('/student');
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });
});
