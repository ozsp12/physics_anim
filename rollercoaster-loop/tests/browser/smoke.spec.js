const { test, expect } = require('@playwright/test');

test('canonical simulation loads in English without runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/rollercoaster-loop/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#pageHeading')).toContainText('Vertical loop');
  await expect(page.locator('#playButton')).toHaveText('Start');
  await page.locator('#playButton').click();
  await expect(page.locator('#stateMetric')).not.toHaveText('Ready');
  await page.waitForTimeout(150);
  expect(errors).toEqual([]);
});

test('legacy lang query does not switch the interface away from English', async ({ page }) => {
  await page.goto('/rollercoaster-loop/?lang=pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#pageHeading')).toContainText('Vertical loop');
  await expect(page.locator('#criticalButton')).toContainText('critical');
});

test('critical-height control sets h/R to 2.5', async ({ page }) => {
  await page.goto('/rollercoaster-loop/');
  await page.locator('#radiusRange').evaluate(el => { el.value = '1.60'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#criticalButton').click();
  await expect(page.locator('#ratioMetric')).toHaveText('2.500');
});

test('continuous status text exists outside the canvas', async ({ page }) => {
  await page.goto('/rollercoaster-loop/');
  await expect(page.locator('#simulationSummary')).not.toBeEmpty();
  await expect(page.locator('#simCanvas')).toHaveAttribute('aria-describedby', 'simulationSummary');
});
