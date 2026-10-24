
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dee-faith-pride.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
