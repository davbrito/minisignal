import react from "@vitejs/plugin-react";
import { globSync } from "node:fs";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

const entries = globSync("src/*.{ts,tsx}", {
  exclude: ["src/_internal/**/*", "tests/**/*"],
});

const externalLibs = Object.keys({
  ...(pkg as unknown as Record<string, object>).dependencies,
  ...(pkg as unknown as Record<string, object>).peerDependencies,
});

export default defineConfig({
  plugins: [
    react(),
    dts({
      exclude: ["src/_internal/**/*", "tests/**/*"],
      compilerOptions: { rootDir: "src" },
    }),
  ],
  build: {
    minify: false,
    outDir: "dist",
    emptyOutDir: true,
    lib: { formats: ["es"], entry: entries },
    rollupOptions: {
      external: externalLibs,
    },
  },
});
