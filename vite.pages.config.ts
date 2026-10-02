import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./static", import.meta.url)),
  base: "/bushido-ops/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  server: { allowedHosts: ["terminal.local"] },
  resolve: { alias: { "@": projectRoot } },
  css: { postcss: projectRoot },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
