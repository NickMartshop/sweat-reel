import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { name: "CSP Report Tests", environment: "node" },
  resolve: { alias: { "@": "/Users/apple/SWEATREEL_WEB_SECURITY_FIX_20261102/src" } }
});