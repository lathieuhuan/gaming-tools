import path from "path";
// import { fileURLToPath } from "node:url";
// import { glob } from "glob";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
// import { libInjectCss } from "vite-plugin-lib-inject-css";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // libInjectCss(),
    dts({ include: ["lib"] }),
  ],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/main.ts"),
      formats: ["es"],
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      // input: Object.fromEntries(
      //   glob.sync("lib/**/*.{ts,tsx}").map((file) => {
      //     console.log(
      //       file,
      //       path.relative("lib", file.slice(0, file.length - path.extname(file).length)),
      //       fileURLToPath(new URL(file, import.meta.url))
      //     );

      //     return [
      //       // The name of the entry point
      //       // lib/nested/foo.ts becomes nested/foo
      //       path.relative("lib", file.slice(0, file.length - path.extname(file).length)),
      //       // The absolute path to the entry file
      //       // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
      //       fileURLToPath(new URL(file, import.meta.url)),
      //     ];
      //   })
      // ),
      output: {
        // assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
    },
  },
});
