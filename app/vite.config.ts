import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load .env from parent folder
  const env = loadEnv(mode, path.resolve(__dirname, '../'), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
          }),
        ],
      },
    },
    build: {
      target: 'es2020',
    },
    server: {
      host: '0.0.0.0',
    },
  }
})
