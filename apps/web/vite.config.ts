import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-virtual'],
          'map-vendor': ['maplibre-gl', 'pmtiles', 'h3-js'],
          'motion-vendor': ['framer-motion'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['sonner', 'vaul', 'lucide-react', 'clsx'],
          'store-vendor': ['zustand', 'immer'],
          'hf-worker': ['@huggingface/transformers'],
        },
      },
    },
  },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  server: { proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } } },
});
