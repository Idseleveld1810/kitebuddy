// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';

export default defineConfig({
  output: 'server',   // not 'static'
  adapter: netlify(), // tells Astro to build Netlify Functions
});