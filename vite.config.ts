import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// 환경변수로 배포 대상 구분
const isGitHub = process.env.VITE_DEPLOY_TARGET === 'GH';

// https://vite.dev/config/
export default defineConfig({
  base: isGitHub ? '/hy_toy/' : '/',
  build: {
    outDir: 'dist'
  },
  plugins: [react(), svgr(), {
    name: 'html-transform',
    transformIndexHtml(html) {
      const version = Date.now(); // 또는 `git rev-parse --short HEAD`
      return html.replace(/style.scss/g, `style.css?v=${version}`)
                 .replace(/script.js/g, `script.js?v=${version}`);
    },
  }],
  server: {
    host: true,
    port: 5173,
  },
})
