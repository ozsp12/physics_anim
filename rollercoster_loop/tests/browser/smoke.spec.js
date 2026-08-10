const { test, expect } = require('@playwright/test');

test('canonical simulation loads without runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/vertical-loop/');
  await expect(page.locator('#pageHeading')).toContainText('Loop vertical');
  await expect(page.locator('#playButton')).toBeVisible();
  await page.locator('#playButton').click();
  await expect(page.locator('#stateMetric')).not.toHaveText('Pronto');
  await page.waitForTimeout(150);
  expect(errors).toEqual([]);
});

test('english localization is available from the same scientific runtime', async ({ page }) => {
  await page.goto('/vertical-loop/?lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#pageHeading')).toContainText('Vertical loop');
  await expect(page.locator('#criticalButton')).toContainText('critical');
});

test('critical-height control sets h/R to 2.5', async ({ page }) => {
  await page.goto('/vertical-loop/');
  await page.locator('#radiusRange').evaluate(el => { el.value = '1.60'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#criticalButton').click();
  await expect(page.locator('#ratioMetric')).toHaveText(/2,500|2\.500/);
});

test('legacy URL redirects to the canonical route', async ({ page }) => {
  await page.goto('/rollercoster_loop/');
  await page.waitForURL('**/vertical-loop/**');
  expect(new URL(page.url()).pathname).toBe('/vertical-loop/');
});

test('continuous status text exists outside the canvas', async ({ page }) => {
  await page.goto('/vertical-loop/?lang=en');
  await expect(page.locator('#simulationSummary')).not.toBeEmpty();
  await expect(page.locator('#simCanvas')).toHaveAttribute('aria-describedby', 'simulationSummary');
});
