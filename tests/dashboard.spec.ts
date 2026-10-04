import { test, expect } from '../fixtures';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

// Selenium: DashboardTests.dashboardListsHoldings
//   Logs in as the shared demo account, then checks: 3 holdings, the first one is
//   "Bluechip Growth Fund", and its details start with "NSE".
test('04 Dashboard lists the holdings for the account', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const dashboard = new DashboardPage(page);

  await dashboard.expectOnDashboard();
  await expect(dashboard.holdings).toHaveCount(3);

  const firstHolding = dashboard.holdings.first();
  const firstHoldingMeta = firstHolding.locator('text=/NSE|BSE/').first();

  await expect(firstHolding).toContainText('Bluechip Growth Fund');
  await expect(firstHoldingMeta).toContainText(/^NSE/);
});

// Selenium: DashboardTests.emptyAccountShowsMessage
//   Creates a brand-new account with no holdings, signs in as it, and expects the
//   empty-state text and zero holdings.
test('05 An account with no holdings shows the empty message', async ({ page, createAccount }) => {
  const account = await createAccount({ holdings: [] });
  const dashboard = new DashboardPage(page);

  await page.goto('/login');
  await page.evaluate((accountId) => {
    localStorage.setItem('holdingsSandbox.accountId', accountId);
  }, account.accountId);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome, ${account.username}`);
  await expect(dashboard.noHoldingsMessage).toBeVisible();
  await expect(dashboard.holdings).toHaveCount(0);
});
