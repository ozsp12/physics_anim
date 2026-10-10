const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true
});

test('mobile playback controls start, pause, resume, and reset the animation', async ({ page }) => {
  await page.goto('/rollercoaster-loop/');

  const play = page.locator('#mobilePlayButton');
  const reset = page.locator('#mobileResetButton');

  await expect(play).toBeVisible();
  await expect(reset).toBeVisible();
  await expect(play).toHaveText('Start');
  await expect(page.locator('#stateMetric')).toHaveText('Ready');

  await play.tap();
  await expect(play).toHaveText('Pause');
  await expect(page.locator('#playButton')).toHaveText('Pause');
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#stateMetric')).toHaveText('Descending');

  await expect.poll(async () => page.locator('#speedMetric').textContent()).not.toBe('0.00 m/s');

  await play.tap();
  await expect(play).toHaveText('Resume');
  await expect(page.locator('#playButton')).toHaveText('Resume');
  await expect(play).toHaveAttribute('aria-pressed', 'false');

  await play.tap();
  await expect(play).toHaveText('Pause');
  await reset.tap();
  await expect(play).toHaveText('Start');
  await expect(page.locator('#stateMetric')).toHaveText('Ready');
  await expect(page.locator('#speedMetric')).toHaveText('0.00 m/s');
});

test('mobile buttons precede the canvas, which permits vertical touch scrolling', async ({ page }) => {
  await page.goto('/rollercoaster-loop/');

  await expect(page.locator('#simCanvas')).toHaveCSS('touch-action', 'pan-y');

  const geometry = await page.evaluate(() => {
    const buttons = document.querySelector('.mobile-actions').getBoundingClientRect();
    const canvas = document.querySelector('#simCanvas').getBoundingClientRect();
    return {
      buttonsBottom: buttons.bottom,
      canvasTop: canvas.top,
      viewportWidth: innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
  });

  expect(geometry.buttonsBottom).toBeLessThanOrEqual(geometry.canvasTop);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});
