import { test, expect } from '../fixtures';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

// ---------------------------------------------------------------------------
// 01 is finished for you, so you can see the Selenium-to-Playwright shape.
//
// Selenium (LoginTests.validLoginLandsOnDashboard):
//   loginPage.open();
//   loginPage.login("Retail Banking", "demo", "demo1234");
//   loginPage.waitForDashboard();
//   assertTrue(driver.getCurrentUrl().contains("/dashboard"));
//   assertEquals("Welcome, demo", dashboard.welcomeText());
//
// Notice what disappeared: there is no waitForDashboard and no driver.
// The URL assertion and the text assertion both wait on their own.
// ---------------------------------------------------------------------------
test('01 Valid login lands on the dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', 'demo', 'demo1234');

  await login.expectOnDashboard();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome, demo');
});

// ---------------------------------------------------------------------------
// 02 is half done. Finish it, then change test.fixme( to test(
//
// Selenium (LoginTests.wrongPasswordShowsError):
//   loginPage.open();
//   loginPage.login("Retail Banking", "demo", "not-the-password");
//   assertEquals("Invalid area, username or password", loginPage.errorText());
//   assertTrue(driver.getCurrentUrl().contains("/login"));
// ---------------------------------------------------------------------------
test('02 Wrong password shows an error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', 'demo', 'demo123');

  await expect(login.errorMessage).toHaveText('Invalid area, username or password');
  await expect(page).toHaveURL(/\/login/);
});

// ---------------------------------------------------------------------------
// 03 Every business area can log in.
// Selenium used a JUnit @ParameterizedTest with a @CsvSource of three rows:
//   Retail Banking,demo  /  Corporate Banking,demo2  /  NRI Services,demo3
// After login each row checks the welcome text ("Welcome, <username>") and the area badge.
// Playwright has no parameterized-test annotation: think of a loop that creates one test per row.
// Keep the title format: `03 Every business area can log in: ${area}`
// ---------------------------------------------------------------------------
for (const { area, username, password } of [
  { area: 'Retail Banking', username: 'demo', password: 'demo1234' },
  { area: 'Corporate Banking', username: 'demo2', password: 'demo1234' },
  { area: 'NRI Services', username: 'demo3', password: 'demo1234' },
]) {
  test(`03 Every business area can log in: ${area}`, async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(area, username, password);

    await login.expectOnDashboard();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome, ${username}`);
    await expect(page.getByText(area, { exact: true })).toBeVisible();
  });
}

// ---------------------------------------------------------------------------
// 06 Logging out returns to login and blocks the dashboard.
// Selenium: LoginTests.logOutBlocksDashboard. Log in, click Log Out, expect /login,
// then open /dashboard directly and expect to be sent back to /login.
// Needs the loggedInPage fixture.
// ---------------------------------------------------------------------------
test('06 Logging out returns to login and blocks the dashboard', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const dashboard = new DashboardPage(page);

  await dashboard.logOut();
  await expect(page).toHaveURL(/\/login/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
