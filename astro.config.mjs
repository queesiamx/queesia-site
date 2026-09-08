import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // si lo estás usando
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://queesia.com",
  integrations: [react(), tailwind(), sitemap()],
});
