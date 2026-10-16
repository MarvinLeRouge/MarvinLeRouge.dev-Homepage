import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('not found page', () => {
  test('answers 404 with a link back to the homepage', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('404');
    await expect(page.getByRole('link', { name: /back to base/i })).toHaveAttribute('href', '/');
  });

  test('has no detectable WCAG 2.2 A or AA violations', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
