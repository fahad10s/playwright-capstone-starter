import { test, expect } from '../fixtures';
import { SellPage } from '../pages/SellPage';

async function readHoldingQuantity(api: any, accountId: string | null, holdingName: string) {
  if (!accountId) throw new Error('No accountId available in localStorage.');

  const res = await api.get(`account/${accountId}`);
  expect(res.ok()).toBeTruthy();

  const payload = await res.json();
  const account = payload?.account ?? payload;
  const holdings = Array.isArray(account?.holdings) ? account.holdings : [];

  const match = holdings.find((holding: any) =>
    (holding?.name ?? '').toString().includes(holdingName),
  );

  if (!match) return 0;

  return Number(match.quantity ?? match.qty ?? match.units ?? 0);
}

// All five tests open the sell form for the first holding, "Bluechip Growth Fund".
// The sell form has two groups of radio buttons (Market and Settlement type), a quantity,
// a confirmation checkbox and a "Submit for Redemption" button.

// Selenium: SellTests.sellCashOnNse
//   Choose market NSE, settlement Cash, quantity 1, confirm, submit.
//   Expect the confirmation heading "Transaction submitted and under process",
//   the status "processing" and the settlement "cash".
test('07 Selling on NSE with cash settlement is confirmed', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openFromFirstHolding();
  await sell.chooseMarket('NSE');
  await sell.chooseSettlement('Cash');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.confirmationHeading).toHaveText('Transaction submitted and under process');
  await expect(sell.confirmationStatus).toHaveText('processing');
  await expect(sell.confirmationSettlement).toHaveText('cash');
});

// Selenium: SellTests.chequeNeedsBranch
//   Choose Cheque, quantity 1, confirm, submit, without filling in a branch.
//   Expect the alert "Cheque settlement requires a branch" and to stay on the sell page.
test('08 Cheque settlement without a branch is rejected', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openFromFirstHolding();
  await sell.chooseSettlement('Cheque');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.alert).toHaveText('Cheque settlement requires a branch');
  await expect(page).toHaveURL(/\/sell/);
});

// Selenium: SellTests.chequeWithBranchConfirms
//   Choose NSE and Cheque, branch "Fort, Mumbai", quantity 1, confirm, submit.
//   Expect the settlement "cheque" and the status "processing".
test('09 Cheque settlement with a branch is confirmed', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openFromFirstHolding();
  await sell.chooseMarket('NSE');
  await sell.chooseSettlement('Cheque');
  await sell.enterChequeBranch('Fort, Mumbai');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.confirmationHeading).toHaveText('Transaction submitted and under process');
  await expect(sell.confirmationStatus).toHaveText('processing');
  await expect(sell.confirmationSettlement).toHaveText('cheque');
});

// Selenium: SellTests.oversellIsRejected
//   Quantity 9999, confirm, submit. Expect an alert like "Only 120 units available to sell".
//   The number depends on the account, so match the shape of the sentence.
test('10 Selling more than is held is rejected', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openFromFirstHolding();
  await sell.enterQuantity('9999');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.alert).toContainText(/Only\s+\d+\s+units available to sell/i);
});

// Selenium: SellTests.saleReducesQuantityOnServer
//   Ask the API for the holding's quantity, sell 2 through the UI, ask the API again,
//   expect the quantity to be 2 lower. Playwright's request fixture replaces the Java HttpClient.
test('11 A sale reduces the quantity held on the server', async ({ loggedInPage, api }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  const accountId = await page.evaluate(() => localStorage.getItem('holdingsSandbox.accountId'));
  await expect.poll(async () => await readHoldingQuantity(api, accountId, 'Bluechip Growth Fund'), {
    timeout: 15000,
  }).toBeGreaterThan(0);

  const before = await readHoldingQuantity(api, accountId, 'Bluechip Growth Fund');

  await sell.openFromFirstHolding();
  await sell.enterQuantity('2');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.confirmationHeading).toHaveText('Transaction submitted and under process');

  await expect.poll(async () => await readHoldingQuantity(api, accountId, 'Bluechip Growth Fund'), {
    timeout: 15000,
  }).toBe(before - 2);
});
