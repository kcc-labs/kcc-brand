import type { NextConfig } from "next";

/** The playground is static: every page renders at build time. @kcc/design ships TypeScript source, so Next compiles it. */
const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@kcc/design"],
};

export default config;
