import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  base: '/hy_toy/',
  build: {
    outDir: 'dist'
  },
  plugins: [react(), svgr(), {
    name: 'html-transform',
    transformIndexHtml(html) {
      const version = Date.now(); // 또는 `git rev-parse --short HEAD`
      return html.replace(/style.scss/g, `style.css?v=${version}`)
                 .replace(/script.js/g, `script.js?v=${version}`);
    }
  }],
})
