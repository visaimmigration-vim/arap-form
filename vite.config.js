import { defineConfig } from "vite";

export default defineConfig({
  base: "/arap-form/",
  server: {
    open: false,
  host: true,
  port: 5173,
  strictPort: false,
  allowedHosts: true,
  proxy: {},
  },
  preview: {
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
