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

  test('has no detectable WCAG 2.2 A or AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
