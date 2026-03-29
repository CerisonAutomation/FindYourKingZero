import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react-swc";
import {resolve} from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@/components": resolve(__dirname, "src/components"),
        "@/features": resolve(__dirname, "src/features"),
        "@/hooks": resolve(__dirname, "src/hooks"),
        "@/lib": resolve(__dirname, "src/lib"),
        "@/pages": resolve(__dirname, "src/pages"),
        "@/stores": resolve(__dirname, "src/stores"),
        "@/types": resolve(__dirname, "src/types"),
        "@/utils": resolve(__dirname, "src/utils"),
        "@/integrations": resolve(__dirname, "src/integrations"),
        "@/constants": resolve(__dirname, "src/constants"),
      },
    },

    build: {
      target: "es2022",
      outDir: "dist",
      sourcemap: mode === "development",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1024,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: true,
          passes: 3,
          pure_funcs: ["console.log", "console.debug", "console.info", "console.warn"],
        },
        mangle: {
          safari10: false,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router') || id.includes('react-hook-form')) return 'react-vendor';
              // Heavy libs — separate chunks
              if (id.includes('maplibre-gl')) return 'map-vendor';
              if (id.includes('framer-motion')) return 'motion-vendor';
              if (id.includes('leaflet') || id.includes('supercluster')) return 'geo-vendor';
              // UI
              if (id.includes('lucide-react')) return 'icons-vendor';
              if (id.includes('@radix-ui')) return 'radix-vendor';
              // Data
              if (id.includes('@supabase')) return 'supabase-vendor';
              if (id.includes('@tanstack')) return 'query-vendor';
              if (id.includes('zustand')) return 'state-vendor';
              // P2P
              if (id.includes('trystero') || id.includes('yjs') || id.includes('y-webrtc')) return 'p2p-vendor';
              // AI — split web-llm (huge) separately
              if (id.includes('@mlc-ai/web-llm')) return 'webllm-vendor';
              if (id.includes('@ai-sdk') || id.includes('@huggingface') || id.includes('@assistant-ui')) return 'ai-vendor';
              // Markdown/richtext
              if (id.includes('react-markdown') || id.includes('rehype') || id.includes('remark')) return 'md-vendor';
              // Everything else small enough — let Vite auto-chunk
              return undefined;
            }
          },
        },
      },
    },

    server: {
      port: 5000,
      host: "0.0.0.0",
    },

    preview: {
      port: 5000,
      host: "0.0.0.0",
    },
  };
});
