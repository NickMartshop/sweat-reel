import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { name: "CSP Report Tests", environment: "node" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.url, "../src"),
    },
  },
});