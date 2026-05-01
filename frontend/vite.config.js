import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/__tests__/setup.js",
    coverage: {
      provider: "v8",
      include: ["src/components/**/*.jsx", "src/context/**/*.jsx"],
      exclude: ["src/components/map/**", "src/components/sections/**"],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor":  ["react", "react-dom", "react-router-dom"],
          "motion":        ["framer-motion"],
          "map":           ["leaflet", "react-leaflet"],
          "player":        ["react-player"],
        },
      },
    },
  },
});
