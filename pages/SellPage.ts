import { type Page, expect } from '@playwright/test';

export class SellPage {
  constructor(private readonly page: Page) {}

  get alert() {
    return this.page.getByRole('alert');
  }

  get confirmationHeading() {
    return this.page.getByRole('heading');
  }

  get confirmationStatus() {
    return this.page.locator('dt:text-is("Status") + dd');
  }

  get confirmationSettlement() {
    return this.page.locator('dt:text-is("Settlement") + dd');
  }

  async openFromFirstHolding() {
    const sellButton = this.page.getByRole('button', { name: /Sell\s*\/\s*Redeem/i }).first();
    await expect(sellButton).toBeVisible();
    await sellButton.click();
    await expect(this.page).toHaveURL(/\/sell/);
  }

  async chooseMarket(market: 'NSE' | 'BSE') {
    await this.page.getByRole('radio', { name: new RegExp(`^${market}$`, 'i') }).check();
  }

  async chooseSettlement(settlement: 'Cash' | 'Cheque') {
    await this.page.getByRole('radio', { name: new RegExp(`^${settlement}$`, 'i') }).check();
  }

  async enterQuantity(quantity: string) {
    await this.page.getByLabel(/quantity/i).fill(quantity);
  }

  async enterChequeBranch(branch: string) {
    await this.page.getByLabel(/branch/i).fill(branch);
  }

  async confirmDetails() {
    await this.page.getByLabel(/confirm|confirmation/i).check();
  }

  async submit() {
    await this.page.getByRole('button', { name: /Submit for Redemption/i }).click();
  }

  async errorText() {
    return (await this.alert.textContent())?.trim() ?? '';
  }

  async confirmationHeadingText() {
    return (await this.confirmationHeading.textContent())?.trim() ?? '';
  }

  async confirmationStatusText() {
    return (await this.confirmationStatus.textContent())?.trim() ?? '';
  }

  async confirmationSettlementText() {
    return (await this.confirmationSettlement.textContent())?.trim() ?? '';
  }
}
