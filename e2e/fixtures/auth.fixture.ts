import { type Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(/\/(student|superintendent|trustee|accounts|parent)/, { timeout: 10000 });
}

export const TEST_ACCOUNTS = {
  student: { email: 'student@test.com', password: 'Test1234!' },
  superintendent: { email: 'super@test.com', password: 'Test1234!' },
  trustee: { email: 'trustee@test.com', password: 'Test1234!' },
  accounts: { email: 'accounts@test.com', password: 'Test1234!' },
  parent: { email: 'parent@test.com', password: 'Test1234!' },
};
