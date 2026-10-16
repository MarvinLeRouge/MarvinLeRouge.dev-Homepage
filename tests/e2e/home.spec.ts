import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('homepage', () => {
  test('responds and exposes the document basics', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('MarvinLeRouge.dev');
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('loads only first-party resources, fonts included', async ({ page, baseURL }) => {
    const thirdPartyRequests: string[] = [];
    // Content Security Policy violations are reported as console errors.
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL ?? '').origin) {
        thirdPartyRequests.push(request.url());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    expect(thirdPartyRequests).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(await page.evaluate(() => document.fonts.check('16px "Bebas Neue"'))).toBe(true);
    expect(await page.evaluate(() => document.fonts.check('16px "Share Tech Mono"'))).toBe(true);
  });

  test('has no detectable WCAG 2.2 A or AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
