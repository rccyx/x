/** @type {import("next").NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@rccyx/design",
    "@rccyx/env",
    "@rccyx/auth",
    "@rccyx/components",
    "@rccyx/hooks",
    "@rccyx/models",
    "@rccyx/constants",
    "@rccyx/cross-runtime",
    "@rccyx/monitor",
    "@rccyx/logger",
    "@rccyx/seo",
    "@rccyx/vitest",
    "@rccyx/playwright",
    "@rccyx/eslint",
    "@rccyx/typescript",
    "@rccyx/db",
    "@rccyx/analytics",
    "@rccyx/storage",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // https://github.com/rccyx/security-header-middlewares
  headers() {
    return Promise.resolve([
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
                form-action 'self';
                frame-ancestors 'none';
                upgrade-insecure-requests;
            `
              .split("\n")
              .join(""),
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer, strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options", // for older browsers
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Server",
            value: "deez nuts v69.0.1",
          },
          {
            key: "X-Powered-By",
            value: "deez nuts v69.0.1-pro",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "require-corp",
          },
        ],
      },
    ]);
  },
};

module.exports = baseConfig;
