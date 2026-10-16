import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const HOMEPAGES = [
  { path: '/', lang: 'fr', jobTitle: 'Développeur backend / Data Engineer' },
  { path: '/en/', lang: 'en', jobTitle: 'Backend Developer / Data Engineer' },
];

for (const { path, lang, jobTitle } of HOMEPAGES) {
  test.describe(`homepage ${path}`, () => {
    test('responds and exposes the document basics', async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle('MarvinLeRouge.dev');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(jobTitle)).toBeVisible();
    });

    test('declares every language version with hreflang', async ({ page }) => {
      await page.goto(path);

      const alternates = page.locator('link[rel="alternate"]');
      await expect(alternates).toHaveCount(3);
      await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute(
        'href',
        'https://marvinlerouge.dev/',
      );
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
        'href',
        'https://marvinlerouge.dev/en/',
      );
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
        'href',
        'https://marvinlerouge.dev/',
      );
    });

    test('loads only first-party resources, fonts and avatar included', async ({
      page,
      baseURL,
    }) => {
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

      await page.goto(path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      expect(thirdPartyRequests).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(await page.evaluate(() => document.fonts.check('16px "Bebas Neue"'))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('16px "Share Tech Mono"'))).toBe(true);
      const avatar = page.locator('.avatar-wrapper img');
      expect(await avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });

    test('has no detectable WCAG 2.2 A or AA violations', async ({ page }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });
}
