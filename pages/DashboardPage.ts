import { type Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  get holdings() {
    return this.page.locator('.holding-row');
  }

  get noHoldingsMessage() {
    return this.page.getByText('No holdings remaining.');
  }

  async open() {
    await this.page.goto('/dashboard');
  }

  async logOut() {
    await this.page.getByRole('button', { name: 'Log Out' }).click();
  }

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async welcomeText() {
    return (await this.heading.textContent())?.trim() ?? '';
  }

  async areaText() {
    const area = this.page.getByText(/Retail Banking|Corporate Banking|NRI Services/, { exact: false }).first();
    return (await area.textContent())?.trim() ?? '';
  }

  async holdingCount() {
    return await this.holdings.count();
  }

  async firstHoldingName() {
    return (await this.holdings.first().textContent())?.trim() ?? '';
  }

  async firstHoldingMeta() {
    const meta = this.holdings.first().locator('text=/NSE|BSE/').first();
    return (await meta.textContent())?.trim() ?? '';
  }

  async openFirstHoldingSellForm() {
    await this.page.getByRole('link', { name: /Sell\s*\/\s*Redeem/i }).first().click();
  }
}
