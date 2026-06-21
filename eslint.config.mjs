// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import react from "@eslint-react/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**/*", "node_modules/**/*"]),
  js.configs.recommended,
  ts.configs.recommended,
  react.configs["recommended-typescript"],
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
