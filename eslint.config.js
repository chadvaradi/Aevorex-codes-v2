// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config({
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.venv/**",
    "**/venv/**",
    "eslint.config.js",
    "vite.config.ts",
    "playwright.config.ts",
    "shared/frontend/vite.config.ts",
    "vitest.config.ts",
    "vitest.config.base.ts",
    "postcss.config.js",
    "tailwind.config.js",
    "**/*.config.base.js"
  ],
}, ...tseslint.configs.recommended, {
  files: ["shared/frontend/src/**/*.{ts,tsx}"],
  plugins: {
    react: pluginReact,
    "react-hooks": reactHooks,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
  }
}, storybook.configs["flat/recommended"]); 