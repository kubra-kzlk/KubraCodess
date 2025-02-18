// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import dotenv from "dotenv";

import tailwindcss from "@tailwindcss/vite";

dotenv.config();
// https://astro.build/config
export default defineConfig({
  vite: {
    define: {
      "process.env.CONTENTFUL_SPACE_ID": JSON.stringify(
        process.env.CONTENTFUL_SPACE_ID,
      ),
      "process.env.CONTENTFUL_ACCESS_TOKEN": JSON.stringify(
        process.env.CONTENTFUL_ACCESS_TOKEN,
      ),
    },

    plugins: [tailwindcss()],
  },
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
});