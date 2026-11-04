import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: { name: "CSP Report Tests", environment: "node" },
  plugins: [tsconfigPaths],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
