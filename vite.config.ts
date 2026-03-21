// =============================================================================
// vite.config.ts — Enterprise Vite 8 + Tailwind v4 + React SWC
// Tailwind v4: uses @tailwindcss/vite plugin, NOT postcss plugin
// =============================================================================
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(), // Tailwind v4 — vite plugin replaces postcss plugin
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/features': resolve(__dirname, 'src/features'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/lib': resolve(__dirname, 'src/lib'),
        '@/pages': resolve(__dirname, 'src/pages'),
        '@/stores': resolve(__dirname, 'src/stores'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/integrations': resolve(__dirname, 'src/integrations'),
        '@/constants': resolve(__dirname, 'src/constants'),
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '4.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },

    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React runtime
            vendor: ['react', 'react-dom'],
            // Router
            router: ['react-router-dom'],
            // Data fetching
            query: ['@tanstack/react-query'],
            // UI primitives
            radix: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-slot',
              '@radix-ui/react-toast',
            ],
            // Supabase
            supabase: ['@supabase/supabase-js'],
            // P2P
            p2p: ['trystero', 'y-webrtc-trystero'],
            // AI SDK
            ai: ['ai', '@ai-sdk/openai'],
            // Animations
            motion: ['framer-motion'],
            // Maps
            maps: ['maplibre-gl'],
            // Forms
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },

    server: {
      port: 5173,
      host: true,
      cors: true,
    },

    preview: {
      port: 4173,
      host: true,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'zustand',
        'zod',
      ],
      exclude: [
        'trystero',       // ESM-only — let Vite handle naturally
        'maplibre-gl',    // Large, prefer dynamic
      ],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          'node_modules/**',
          'src/test/**',
          '**/*.d.ts',
          '**/*.config.*',
          'dist/**',
        ],
      },
    },
  };
});
