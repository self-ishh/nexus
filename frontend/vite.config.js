import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  publicDir: "public",
  // 🔥 custom plugin to always copy _redirects into dist
  define: {},
  esbuild: {},
  logLevel: "info",
  server: {},
  preview: {},
  // This ensures _redirects gets copied no matter what
  closeBundle() {
    try {
      copyFileSync(
        resolve(__dirname, "public", "_redirects"),
        resolve(__dirname, "dist", "_redirects")
      );
      console.log("✅ Copied _redirects into dist successfully");
    } catch (err) {
      console.warn("⚠️ Could not copy _redirects:", err.message);
    }
  },
});
