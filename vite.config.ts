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
      chunkSizeWarningLimit: 800,
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
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["framer-motion", "lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-slot", "@radix-ui/react-toast"],
            "data-vendor": ["@supabase/supabase-js", "@tanstack/react-query"],
            "p2p-vendor": ["trystero", "yjs", "y-webrtc"],
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
