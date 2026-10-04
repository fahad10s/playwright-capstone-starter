import { test } from '../fixtures';

// The dashboard has a "View statement" link that opens the statement in a NEW WINDOW.
// Selenium handled that with getWindowHandles() and switchTo().window().

// Selenium: StatementTests.statementOpensInNewWindow
//   Click the link, wait until there are two windows, switch to the new one, expect the
//   heading "Account Statement", close it, and return to the dashboard.
test.fixme('13 The statement opens in a new window', async () => {
  // The "View Statement" button does not exist on the hosted website, so this test is skipped.
});

// Selenium: StatementTests.termsCanBeAcceptedInIframe
//   In the statement window there is an iframe titled "Statement terms" with an
//   "Accept terms" button. Click it and expect the text "Terms accepted" inside the frame.
//   Selenium used switchTo().frame() and switchTo().defaultContent().
test.fixme('14 The terms can be accepted inside the iframe', async () => {
  // The "View Statement" button does not exist on the hosted website, so this test is skipped.
});

// Selenium: StatementTests.marketFilterMultiSelect
//   The statement has a "Markets" multi-select. Choose BSE (1 holding, "National Infra Bond"),
//   then NSE and BSE together (3 holdings), then clear it (3 holdings again).
//   Selenium used the Select class: selectByValue, getAllSelectedOptions, deselectAll.
test.fixme('15 The market filter accepts several selections', async () => {
  // The "View Statement" button does not exist on the hosted website, so this test is skipped.
});
