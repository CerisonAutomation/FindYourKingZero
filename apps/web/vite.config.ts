// ═══════════════════════════════════════════════════════════════
// VERCEL DEPLOYMENT CONFIG
// Self-hosted → Vercel-compatible (Vercel Postgres + KV + Blob)
// ═══════════════════════════════════════════════════════════════

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  plugins: [react(), vercel()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['maplibre-gl'],
          'h3-vendor': ['h3-js'],
        },
      },
    },
  },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
