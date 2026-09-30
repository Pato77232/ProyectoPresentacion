import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDirectory = fileURLToPath(new URL('.', import.meta.url))
const projectDirectory = resolve(frontendDirectory, '..')

// https://vite.dev/config/
export default defineConfig({
  root: projectDirectory,
  base: './',
  cacheDir: resolve(frontendDirectory, 'node_modules/.vite'),
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
  resolve: {
    alias: {
      react: resolve(frontendDirectory, 'node_modules/react'),
      'react-dom': resolve(frontendDirectory, 'node_modules/react-dom'),
    },
  },
  plugins: [react()],
  build: {
    outDir: resolve(frontendDirectory, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(projectDirectory, 'index.html'),
      },
    },
  },
})
