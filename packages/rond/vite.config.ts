import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,
    port: 4200,
  },
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    outDir: "dist-demo",
  },
});
