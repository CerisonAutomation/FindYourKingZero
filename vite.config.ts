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
      rollupOptions: {
        output: {
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
