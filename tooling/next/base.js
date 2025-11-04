import { generateTranspileList } from "./transpile";

const { transpilePackages } = generateTranspileList();

/** @type {import("next").NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages,

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  optimizeFonts: true,
};

module.exports = baseConfig;
