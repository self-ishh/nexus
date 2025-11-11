import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Add hook to copy _redirects after build
      plugins: [
        {
          name: "copy-redirects",
          closeBundle() {
            copyFileSync("public/_redirects", "dist/_redirects");
          },
        },
      ],
    },
  },
});
