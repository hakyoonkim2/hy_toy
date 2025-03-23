import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default ({ mode }: ConfigEnv): UserConfigExport => {
    // 1. 환경 변수 로드
    const env = loadEnv(mode, process.cwd());

    // 2. 환경 변수 접근 (VITE_ 접두어 반드시 필요)
    const isGitHub = env.VITE_DEPLOY_TARGET === 'GH';

    return defineConfig({
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
}


