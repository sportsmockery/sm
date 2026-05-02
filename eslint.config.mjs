import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "jsx-a11y/alt-text": "error",
      // Tip #32 — interactive-element a11y enforcement.
      // anchor-is-valid is hard error: <a> without a real href is the most
      // common screen-reader trap and there's never a good reason for it.
      // The static-element-interaction rules are warn so existing modal-
      // backdrop dismiss patterns don't break the build, but new code
      // should prefer real <button>/<a> elements with keyboard handlers.
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
