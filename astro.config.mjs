// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output — deploys to Vercel (or any static host).
// `site` is the canonical URL: drives sitemap, canonical links and OG image URLs.
// Update it to https://www.dobojo.ch once the custom domain is connected.
export default defineConfig({
  site: 'https://dobojo.vercel.app',
  server: { port: 5190, host: true },
  integrations: [sitemap()],
});
