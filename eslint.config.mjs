import { registerHooks } from "node:module";
import { defineConfig, globalIgnores } from "eslint/config";

// TypeScript 7 (the project compiler) has no JavaScript API, and typescript-eslint needs one. Microsoft ships the
// TypeScript 6 API as @typescript/typescript6 for this case, so the lint run resolves "typescript" to it. Only this
// ESLint process is affected; `tsc` and `next build` use TypeScript 7.
registerHooks({
  resolve: (specifier, context, next) => next(specifier === "typescript" ? "@typescript/typescript6" : specifier, context),
});

const { default: nextVitals } = await import("eslint-config-next/core-web-vitals");
const { default: nextTs } = await import("eslint-config-next/typescript");

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: { next: { rootDir: "apps/playground/" } },
    rules: {
      // The design package renders plain <a>: it must work in any React app, not only Next.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores(["**/.next/**", "**/out/**", "**/node_modules/**", "**/next-env.d.ts", "html/**", "packages/design/tailwind/preset.js"]),
]);
