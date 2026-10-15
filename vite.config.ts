import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import seo from "./seo/plugin.ts";

// Your real profile lives in the git-ignored profile.local/; profile/ holds the sample.
const profileDir = existsSync(
  resolve(import.meta.dirname, "profile.local/profile.json"),
)
  ? "profile.local"
  : "profile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    seo(resolve(import.meta.dirname, profileDir, "profile.json")),
  ],
  root: "src",
  resolve: {
    alias: { "@profile": resolve(import.meta.dirname, profileDir) },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
