import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import removeConsole from 'vite-plugin-remove-console';
import path from 'path';

export default ({ mode }: ConfigEnv): UserConfigExport => {
  // 1. 환경 변수 로드
  const env = loadEnv(mode, process.cwd());

  // 2. 환경 변수 접근 (VITE_ 접두어 반드시 필요)
  const isGitHub = env.VITE_DEPLOY_TARGET === 'GH';

  return defineConfig({
    base: isGitHub ? '/hy_toy/' : '/',
    build: {
      outDir: 'dist',
    },
    worker: {
      format: 'es',
    },
    resolve: {
      alias: {
        '@typinggame': path.resolve(__dirname, 'src/typinggame'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@bitCoinChart': path.resolve(__dirname, 'src/bitCoinChart'),
        '@stopwatch': path.resolve(__dirname, 'src/stopwatch'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@style': path.resolve(__dirname, 'src/style'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      svgr(),
      removeConsole(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          const version = Date.now(); // 또는 `git rev-parse --short HEAD`
          return html
            .replace(/style.scss/g, `style.css?v=${version}`)
            .replace(/script.js/g, `script.js?v=${version}`);
        },
      },
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/proxy': {
          target: 'https://proxy-server-flax-rho.vercel.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // 그대로 전달 (/api/proxy 그대로 유지)
        },
      },
    },
  });
};
