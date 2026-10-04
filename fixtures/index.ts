import { test as base, expect, request as pwRequest, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:4000/api/';

export interface SeededAccount {
  accountId: string;
  username: string;
  password: string;
}

interface SeedOptions {
  holdings?: { name: string; market: string; quantity: number; avgPrice: number }[];
}

type Fixtures = {
  /** An API client pointed at the Sandbox API. (given) */
  api: APIRequestContext;
  /** Creates a brand-new account for this test. (given) */
  createAccount: (options?: SeedOptions) => Promise<SeededAccount>;
  /** A page already signed in as a brand-new account, sitting on the dashboard. (YOU BUILD THIS) */
  loggedInPage: { page: Page; account: SeededAccount };
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const api = await pwRequest.newContext({ baseURL: API_URL });
    await use(api);
    await api.dispose();
  },

  createAccount: async ({ api }, use) => {
    await use(async (options = {}) => {
      const res = await api.post('test/seed-account', { data: options });
      expect(res.ok()).toBeTruthy();
      return res.json();
    });
  },

  // Build a signed-in page for the test using a fresh account.
  // We must set the dashboard session in localStorage before navigating to /dashboard,
  // otherwise the app will redirect back to /login.
  // Avoid page.addInitScript here: that runs again on later navigations, including after a test logs out,
  // which would make the next test keep a stale signed-in session.
  loggedInPage: async ({ page, createAccount }, use) => {
    const account = await createAccount();

    await page.goto('/login');
    await page.evaluate((accountId) => {
      localStorage.setItem('holdingsSandbox.accountId', accountId);
    }, account.accountId);

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome, ${account.username}`);

    await use({ page, account });
  },
});

export { expect };
