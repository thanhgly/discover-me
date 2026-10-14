import path from "node:path";
import { defineConfig } from "vitest/config";
import configuration from "./vite.config.ts";

export default defineConfig({
  ...configuration,
  resolve: {
    alias: {
      ...configuration.resolve?.alias,
      test: path.resolve(import.meta.dirname, "./test"),
    },
  },
  test: {
    dir: import.meta.dirname,
    globals: true,
    environment: "jsdom",
    setupFiles: path.resolve(import.meta.dirname, "test/setup.ts"),
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.test.*"],
    },
  },
});
