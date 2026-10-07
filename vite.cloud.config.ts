import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudDevPlugin } from "./build/cloud-dev-plugin";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("./static", import.meta.url)), base: "/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)), plugins: [react(), cloudDevPlugin(projectRoot)],
  server: { allowedHosts: ["terminal.local"] }, resolve: { alias: { "@": projectRoot } }, css: { postcss: projectRoot },
  build: { outDir: fileURLToPath(new URL("./dist-cloud", import.meta.url)), emptyOutDir: true },
});
