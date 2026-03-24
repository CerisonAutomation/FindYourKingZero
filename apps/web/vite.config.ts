import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),

    // Brotli + Gzip pre-compression — Vercel serves directly, 60-80% smaller [web:137]
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithm: 'gzip',           exclude: [/\.(br)$/, /\.(gz)$/] }),

    // PWA — offline, installable, background sync [web:137]
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FindYourKing',
        short_name: 'FYK',
        description: 'Find Your King — Gay dating, reimagined',
        theme_color: '#E5192E',
        background_color: '#060610',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),

    // Bundle visualizer — only in analyze mode
    isProd && process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,           // speeds up build output step
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'query-vendor':  ['@tanstack/react-query', '@tanstack/react-virtual'],
          'map-vendor':    ['maplibre-gl', 'pmtiles', 'h3-js'],
          'motion-vendor': ['framer-motion'],
          'form-vendor':   ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor':     ['sonner', 'vaul', 'lucide-react', 'clsx'],
          'store-vendor':  ['zustand', 'immer'],
          'hf-worker':     ['@huggingface/transformers'],
        },
      },
    },
  },

  worker: { format: 'es' },

  optimizeDeps: {
    exclude: ['@huggingface/transformers'],  // WASM — handled in Web Worker only
  },

  esbuild: {
    legalComments: 'none',  // strips license comment blocks from output
    target: 'esnext',
  },
});
