// ═══════════════════════════════════════════════════════════════
// VITE CONFIG — Latest Vite 6 + PWA + Vercel + responsive
// ═══════════════════════════════════════════════════════════════

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['maplibre-gl'],
          'h3-vendor': ['h3-js'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
  },
  worker: { format: 'es' },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
    include: ['react', 'react-dom', 'zustand'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    transformer: 'lightningcss',
  },
});
