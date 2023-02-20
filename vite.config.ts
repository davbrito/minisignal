import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pkg from "./package.json" assert { type: "json" };
import dts from "vite-plugin-dts";

const entries = await fs
  .readdir(new URL("./src", import.meta.url), { withFileTypes: true })
  .then((files) =>
    files
      .filter((file) => file.isFile() && /\.tsx?$/.test(file.name))
      .reduce((acc, file) => {
        const name = file.name.replace(/\.[jt]sx?$/, "");
        acc[name] = fileURLToPath(
          new URL(`./src/${file.name}`, import.meta.url)
        );
        return acc;
      }, {} as Record<string, string>)
  );

const externalLibs = Object.keys({
  ...pkg.dependencies,
  ...(pkg as unknown as Record<string, object>).peerDependencies,
});

export default defineConfig({
  plugins: [
    react(),
    dts({
      exclude: ["src/_internal/**/*"],
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
