import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["lib"],
      exclude: ["src"],
      tsconfigPath: "./tsconfig.lib.json",
    }),
  ],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, "lib/main.ts"),
        style: path.resolve(__dirname, "lib/style.css"),
      },
      formats: ["es"],
    },
    cssCodeSplit: true,
    copyPublicDir: false,
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes("main.css")) {
            return "components.css";
          }
          if (assetInfo.names.includes("style.css")) {
            return "style.css";
          }
          // Default naming for other assets
          return "assets/[name].[ext]";
        },
      },
    },
  },
});
