// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import favicons from "astro-favicons";
import node from "@astrojs/node";


// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: "https://yamikhal.com",
  integrations: [mdx(),favicons()],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
      defaultLocale: "en",
      locales: ["en", "de"],
      routing: {
          prefixDefaultLocale: true,
      },
	},
});