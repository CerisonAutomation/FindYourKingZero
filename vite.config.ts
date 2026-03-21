import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

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
      target: "es2020",
      outDir: "dist",
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
          pure_funcs: ["console.log", "console.debug", "console.info"],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": [
              "react",
              "react-dom",
              "react-router-dom",
            ],
            "ui-vendor": [
              "framer-motion",
              "lucide-react",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-slot",
              "@radix-ui/react-toast",
            ],
            "supabase-vendor": [
              "@supabase/supabase-js",
            ],
            "map-vendor": [
              "leaflet",
              "maplibre-gl",
            ],
          },
        },
      },
    },

    server: {
      port: 5173,
      host: true,
    },

    preview: {
      port: 4173,
      host: true,
    },
  };
});
