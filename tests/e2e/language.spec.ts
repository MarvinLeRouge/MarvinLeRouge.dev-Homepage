import { expect, test } from '@playwright/test';

test.describe('language switcher', () => {
  test('marks the current language and links to the other one', async ({ page }) => {
    await page.goto('/');

    const switcher = page.getByRole('navigation', { name: 'Langue' });
    await expect(switcher.getByRole('link', { name: /FR/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(switcher.getByRole('link', { name: /EN/ })).toHaveAttribute('href', '/en/');
  });

  test('remembers the chosen language on the next visit to the homepage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /EN/ }).click();
    await expect(page).toHaveURL(/\/en\/$/);

    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.getByRole('link', { name: /FR/ }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await page.goto('/en/');
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('lets the back button return to the previous language', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /EN/ }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await page.getByRole('link', { name: /FR/ }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');

    await page.goBack();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('loads the preference script as a standalone classic script', async ({ page, request }) => {
    await page.goto('/');
    const script = page.locator('head script[src]');
    await expect(script).toHaveCount(1);
    await expect(script).not.toHaveAttribute('type', 'module');

    const source = await (await request.get((await script.getAttribute('src')) ?? '')).text();
    expect(source).not.toMatch(/^\s*(import|export)\b/m);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('serves French at the root and switches with plain links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    await page.getByRole('link', { name: /EN/ }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
