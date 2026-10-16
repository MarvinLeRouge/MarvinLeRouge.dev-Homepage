// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://marvinlerouge.dev',
  // Whitespace compression collapses meaningful spaces between inline elements.
  compressHTML: false,
  build: {
    // Hashed external stylesheets: long-term cacheable and CSP-friendly.
    inlineStylesheets: 'never',
  },
});
