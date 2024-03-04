import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 4200,
  },
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
});
