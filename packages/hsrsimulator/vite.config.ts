import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 4202,
  },
  resolve: {
    alias: {
      "@Backend": path.resolve(__dirname, "./src/backend"),
      "@Src": path.resolve(__dirname, "./src"),
    },
  },
})
