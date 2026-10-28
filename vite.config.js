import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project sites are served from /<repo-name>/, so the base path
// is injected at build time by .github/workflows/deploy.yml (BASE_PATH).
// Locally it defaults to '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
})
