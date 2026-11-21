import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
    env: {
      VITE_CLOUDINARY_CLOUD_NAME: "test-cloud",
      VITE_CLOUDINARY_UPLOAD_PRESET: "test_preset",
      VITE_CLOUDINARY_FOLDER: "img-ventory",
    },
  },
});
