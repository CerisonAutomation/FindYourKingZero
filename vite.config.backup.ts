import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/features': resolve(__dirname, 'src/features'),
        '@/lib': resolve(__dirname, 'src/lib'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/pages': resolve(__dirname, 'src/pages'),
        '@/assets': resolve(__dirname, 'src/assets'),
        '@/test': resolve(__dirname, 'src/test')
      }
    },

    build: {
      target: 'es2020',
      minify: isProduction ? 'esbuild' : false,
      sourcemap: isDevelopment,
      chunkSizeWarningLimit: 1000
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom', 
        '@supabase/supabase-js',
        '@supabase/auth-js',
        'react-router-dom',
        'date-fns',
        'framer-motion'
      ]
    },

    server: {
      port: 3000,
      host: true,
      open: false
    },

    preview: {
      port: 4173,
      host: true
    },

    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(isProduction),
      __TEST__: JSON.stringify(mode === 'test')
    },

    css: {
      devSourcemap: isDevelopment
    },

    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  }
})
