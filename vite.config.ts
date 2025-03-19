import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  base: '/hy_toy/',
  build: {
    outDir: 'dist'
  },
  plugins: [react(), svgr()],
})
