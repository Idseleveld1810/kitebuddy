import { defineConfig } from 'astro/config'
import netlify from '@astrojs/netlify/functions'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  output: 'server',            // <— runtime SSR
  adapter: netlify(),          // <— Netlify Functions
  trailingSlash: 'never',
  integrations: [react(), tailwind()],
})