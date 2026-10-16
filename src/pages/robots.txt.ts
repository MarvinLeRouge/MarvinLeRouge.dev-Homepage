import type { APIRoute } from 'astro';

/** Lets every crawler in and points to the sitemap, on the domain configured in `site`. */
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`);
