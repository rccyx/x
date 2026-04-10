import { transpilePackages } from "./transpile";

/** @type {import("next").NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: transpilePackages(),

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = baseConfig;
