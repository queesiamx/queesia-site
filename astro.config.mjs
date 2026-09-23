import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // si lo estás usando
import sitemap from "@astrojs/sitemap";

const excludedSitemapPathnames = new Set([
  "/admin-chatbot-queries/",
  "/app/",
  "/blog/post/",
  "/categorias/",
  "/dashboard/",
  "/gracias/",
  "/mis-consultas/",
]);

const shouldIncludeInSitemap = (page) => {
  const { pathname } = new URL(page);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return !excludedSitemapPathnames.has(normalizedPathname);
};

export default defineConfig({
  site: "https://queesia.com",
  integrations: [react(), tailwind(), sitemap({ filter: shouldIncludeInSitemap })],
});
