import { defineConfig } from 'vite'
import pkg from "@lovable.dev/vite-tanstack-config";
const { lovableTanstackConfig } = pkg;

export default defineConfig({
  ...lovableTanstackConfig({
    nitro: true
  })
})
