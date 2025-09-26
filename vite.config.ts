import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(fileURLToPath(new URL(".", import.meta.url)), "src/main.ts"),
      name: "DOMShield",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => `dom-shield.${format}.js`,
    },
    rollupOptions: {
      // avoid bundling rrweb inside
      external: ["rrweb"],
      output: {
        globals: {
          rrweb: "rrweb",
        },
      },
    },
  },
});
