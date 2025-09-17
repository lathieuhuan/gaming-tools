import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: [/\.worker\.(js|ts)$/],
    }),
  ],
  server: {
    open: true,
    port: 4201,
  },
  resolve: {
    alias: {
      "@Store": path.resolve(__dirname, "./src/store"),
      "@Calculation": path.resolve(__dirname, "./src/calculation"),
      "@OptimizeDept": path.resolve(__dirname, "./src/systems/optimize-dept"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
