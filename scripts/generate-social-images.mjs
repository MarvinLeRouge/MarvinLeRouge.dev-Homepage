// Generates the link preview images (public/og/home-<locale>.png, 1200 x 630) and the Apple touch icon.
// Run by hand after changing the identity, the job title or the avatar: npm run social-images
// Texts come from src/i18n (TypeScript files read directly by Node, type imports only).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { CIVIL_NAME } from '../src/i18n/identity.ts';
import { LOCALES } from '../src/i18n/locales.ts';
import { UI } from '../src/i18n/ui.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const asset = (path) => pathToFileURL(join(root, 'src/assets', path)).href;
const output = join(root, 'public');
const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const template = (jobTitle) => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Bebas Neue'; src: url('${asset('fonts/bebas-neue-latin.woff2')}'); }
  @font-face { font-family: 'Share Tech Mono'; src: url('${asset('fonts/share-tech-mono-latin.woff2')}'); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; padding: 28px;
    background: #111 repeating-linear-gradient(-55deg, transparent 0 28px, rgba(255, 200, 0, 0.06) 28px 56px);
    font-family: 'Share Tech Mono', monospace; color: #f0f0f0;
  }
  .frame {
    height: 100%; border: 6px solid #ffc800; background: #0a0a0a;
    display: flex; flex-direction: column;
  }
  .tape {
    background: #ffc800; color: #111; text-align: center; padding: 14px;
    font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 0.35em;
  }
  .identity { flex: 1; display: flex; align-items: center; justify-content: center; gap: 56px; }
  .avatar { width: 230px; height: 230px; border-radius: 50%; border: 5px solid #ffc800; }
  h1 { font-family: 'Bebas Neue', sans-serif; font-weight: 400; font-size: 132px; letter-spacing: 0.05em; line-height: 1; }
  .le { color: #ffc800; } .rouge { color: #e03030; }
  .name { margin-top: 10px; font-size: 30px; letter-spacing: 0.3em; color: #bbb; }
  .job { margin-top: 26px; font-size: 26px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; }
</style>
</head>
<body>
  <div class="frame">
    <div class="tape">&#9888; marvinlerouge.dev &#9888;</div>
    <div class="identity">
      <img class="avatar" src="${asset('images/avatar.png')}" alt="">
      <div>
        <h1>Marvin<span class="le">Le</span><span class="rouge">Rouge</span></h1>
        <p class="name">${escapeHtml(CIVIL_NAME.toUpperCase())}</p>
        <p class="job">${escapeHtml(jobTitle)}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

await mkdir(join(output, 'og'), { recursive: true });
// The template is opened from a file so it can load the fonts and the avatar through file:// URLs.
const workDir = await mkdtemp(join(tmpdir(), 'social-images-'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const locale of LOCALES) {
    const file = join(workDir, `${locale}.html`);
    await writeFile(file, template(UI[locale].home.jobTitle));
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(output, 'og', `home-${locale}.png`) });
  }
} finally {
  await browser.close();
  await rm(workDir, { recursive: true, force: true });
}

await sharp(join(root, 'src/assets/images/avatar.png'))
  .resize(180, 180)
  .png()
  .toFile(join(output, 'apple-touch-icon.png'));
