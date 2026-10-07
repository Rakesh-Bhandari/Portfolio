import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE: "/" for Vercel / custom domains, "/Portfolio/" for GitHub Pages (set VITE_BASE).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('@react-three/postprocessing') || id.includes('node_modules/postprocessing')) return 'postfx'
          if (id.includes('@react-three') || id.includes('three-stdlib') || id.includes('maath')) return 'r3f'
        },
      },
    },
  },
})
