import { expect, test } from '@playwright/test';
import { UI } from '../../src/i18n/ui';

const SITE = 'https://marvinlerouge.dev';

const HOMEPAGES = [
  {
    path: '/',
    title: 'Jean Ceugniet, développeur backend / Data Engineer',
    description: UI.fr.homeMeta.description,
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    image: '/og/home-fr.png',
  },
  {
    path: '/en/',
    title: 'Jean Ceugniet, Backend Developer / Data Engineer',
    description: UI.en.homeMeta.description,
    locale: 'en_US',
    alternateLocale: 'fr_FR',
    image: '/og/home-en.png',
  },
];

const meta = (property: string) => `meta[property="${property}"], meta[name="${property}"]`;

for (const { path, title, description, locale, alternateLocale, image } of HOMEPAGES) {
  test.describe(`metadata of ${path}`, () => {
    test('describes the page for search engines', async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveTitle(title);
      await expect(page.locator(meta('description'))).toHaveAttribute('content', description);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + path);
      await expect(page.locator(meta('robots'))).toHaveCount(0);
    });

    test('describes the page for link previews', async ({ page }) => {
      await page.goto(path);

      await expect(page.locator(meta('og:title'))).toHaveAttribute('content', title);
      await expect(page.locator(meta('og:description'))).toHaveAttribute('content', description);
      await expect(page.locator(meta('og:url'))).toHaveAttribute('content', SITE + path);
      await expect(page.locator(meta('og:type'))).toHaveAttribute('content', 'website');
      await expect(page.locator(meta('og:site_name'))).toHaveAttribute(
        'content',
        'MarvinLeRouge.dev',
      );
      await expect(page.locator(meta('og:locale'))).toHaveAttribute('content', locale);
      await expect(page.locator(meta('og:locale:alternate'))).toHaveAttribute(
        'content',
        alternateLocale,
      );
      await expect(page.locator(meta('og:image'))).toHaveAttribute('content', SITE + image);
      await expect(page.locator(meta('og:image:width'))).toHaveAttribute('content', '1200');
      await expect(page.locator(meta('og:image:height'))).toHaveAttribute('content', '630');
      await expect(page.locator(meta('og:image:alt'))).toHaveAttribute('content', /.+/);
      await expect(page.locator(meta('twitter:card'))).toHaveAttribute(
        'content',
        'summary_large_image',
      );
    });

    test('serves a 1200 x 630 preview image', async ({ page }) => {
      await page.goto(image);

      const size = await page
        .locator('img')
        .evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
      expect(size).toEqual([1200, 630]);
    });

    test('identifies the person behind the site', async ({ page }) => {
      await page.goto(path);

      const data = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').textContent()) ?? '',
      );
      expect(data).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Jean Ceugniet',
        alternateName: 'MarvinLeRouge',
        url: SITE + path,
        sameAs: [
          'https://github.com/MarvinLeRouge',
          'https://www.linkedin.com/in/jean-ceugniet-developpeur-web/',
        ],
      });
    });
  });
}

test.describe('site-wide files', () => {
  test('declares the favicons', async ({ page, request }) => {
    await page.goto('/');

    for (const selector of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
      const href = await page.locator(selector).getAttribute('href');
      expect((await request.get(href ?? '')).status()).toBe(200);
    }
  });

  test('lists both homepages in the sitemap, with their alternates', async ({ request }) => {
    const index = await (await request.get('/sitemap-index.xml')).text();
    expect(index).toContain(`${SITE}/sitemap-0.xml`);

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain(`<loc>${SITE}/</loc>`);
    expect(sitemap).toContain(`<loc>${SITE}/en/</loc>`);
    expect(sitemap).toContain(`hreflang="en" href="${SITE}/en/"`);
    expect(sitemap).not.toContain('/404');
  });

  test('lets crawlers in and points them to the sitemap', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();

    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('keeps the not found page out of search results', async ({ page }) => {
    await page.goto('/does-not-exist/');

    await expect(page.locator(meta('robots'))).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
