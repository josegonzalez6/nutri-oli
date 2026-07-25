import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import tseslint from "typescript-eslint";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "jsx-a11y": jsxA11y
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
];

export default config;
